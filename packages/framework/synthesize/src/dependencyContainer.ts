/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    AsyncFluidObjectProvider,
    FluidObjectSymbolProvider,
    FluidObjectProvider,
    AsyncOptionalFluidObjectProvider,
    AsyncRequiredFluidObjectProvider,
} from "./types";
import {
    IFluidDependencySynthesizer,
} from "./IFluidDependencySynthesizer";

/**
 * DependencyContainer is similar to a IoC Container. It takes providers and will
 * synthesize an object based on them when requested.
 */
export class DependencyContainer<TMap> implements IFluidDependencySynthesizer {
    private readonly providers = new Map<keyof TMap, FluidObjectProvider<any>>();
    private readonly parents: IFluidDependencySynthesizer[];
    public get IFluidDependencySynthesizer() { return this; }

    public constructor(... parents: (IFluidDependencySynthesizer | undefined)[]) {
        this.parents = parents.filter((v): v is IFluidDependencySynthesizer => v !== undefined);
    }

    /**
     * Add a new provider
     * @param type - Name of the Type T being provided
     * @param provider - A provider that will resolve the T correctly when asked
     * @throws - If passing a type that's already registered
     */
    public register<T extends keyof TMap = keyof TMap>(type: T, provider: FluidObjectProvider<Pick<TMap, T>>): void {
        if (this.providers.has(type)) {
            throw new Error(`Attempting to register a provider of type ${type} that already exists`);
        }

        this.providers.set(type, provider);
    }

    /**
     * Remove a provider
     * @param type - Name of the provider to remove
     */
    public unregister(type: keyof TMap): void {
        if (this.providers.has(type)) {
            this.providers.delete(type);
        }
    }

    /**
     * {@inheritDoc (IFluidDependencySynthesizer:interface).synthesize}
     */
    public synthesize<O, R = undefined | Record<string, never>>(
        optionalTypes: FluidObjectSymbolProvider<O>,
        requiredTypes: Required<FluidObjectSymbolProvider<R>>,
    ): AsyncFluidObjectProvider<O, R> {
        const base: AsyncFluidObjectProvider<O, R> = {} as any;
        this.generateRequired<R>(base, requiredTypes);
        this.generateOptional<O>(base, optionalTypes);
        Object.defineProperty(base, IFluidDependencySynthesizer, { get: () => this });
        return base;
    }

    /**
     * {@inheritDoc (IFluidDependencySynthesizer:interface).has}
     * @param excludeParents - If true, exclude checking parent registries
     */
    public has(type: string, excludeParents?: boolean): boolean {
        if (this.providers.has(type as keyof TMap)) {
            return true;
        }
        if (excludeParents !== true) {
            return this.parents.some((p: IFluidDependencySynthesizer) => p.has(type));
        }
        return false;
    }

    private generateRequired<T>(
        base: AsyncRequiredFluidObjectProvider<T>,
        types: Required<FluidObjectSymbolProvider<T>>,
    ) {
        if(types === undefined) return;
        for(const key of Object.keys(types) as unknown as (keyof TMap)[]) {
            const provider = this.resolveProvider(key);
            if(provider === undefined) {
                throw new Error(`Object attempted to be created without registered required provider ${key}`);
            }
            Object.defineProperty(
                base,
                key,
                provider,
            );
        }
    }

    private generateOptional<T>(
        base: AsyncOptionalFluidObjectProvider<T>,
        types: FluidObjectSymbolProvider<T>,
    ) {
        if(types === undefined) return;
        for(const key of Object.keys(types) as unknown as (keyof TMap)[]) {
            // back-compat: in 0.56 we allow undefined in the types, but we didn't before
            // this will keep runtime back compat, eventually we should support undefined properties
            // rather than properties that return promises that resolve to undefined
            const provider = this.resolveProvider(key) ?? {get:()=>Promise.resolve(undefined)};
            Object.defineProperty(
                base,
                key,
                provider,
            );
        }
    }

    private resolveProvider<T extends keyof TMap>(t: T): PropertyDescriptor | undefined {
        // If we have the provider return it
        const provider = this.providers.get(t);
        if (provider === undefined) {
            for(const parent of this.parents) {
                const sp = { [t]: t } as FluidObjectSymbolProvider<Pick<TMap, T>>;
                const syn = parent.synthesize<Pick<TMap, T>,{}>(
                    sp,
                    {});
                const descriptor = Object.getOwnPropertyDescriptor(syn, t);
                if (descriptor !== undefined) {
                    return descriptor;
                }
            }
            return undefined;
        }

        // The double nested gets are required for lazy loading the provider resolution
        if (typeof provider === "function") {
            return {
                get() {
                    if (provider && typeof provider === "function") {
                        return Promise.resolve(this[IFluidDependencySynthesizer])
                            .then(async (fds): Promise<any> => provider(fds))
                            .then((p) => p?.[t]);
                    }
                },
            };
        }
        return {
                get() {
                    if (provider) {
                        return Promise.resolve(provider).then((p) => {
                            if (p) {
                                return p[t];
                            }
                        });
                    }
                },
            };
    }
}
