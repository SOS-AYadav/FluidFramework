/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { IResolvedUrl, IUrlResolver } from "@fluidframework/driver-definitions";
import { IRequest } from "@fluidframework/core-interfaces";
import { LocalResolver } from "@fluidframework/local-driver";
import { InsecureUrlResolver } from "@fluidframework/driver-utils";
import { ITinyliciousRouteOptions, RouteOptions } from "./loader";
import { OdspUrlResolver } from "./odspUrlResolver";

export const dockerUrls = {
    hostUrl: "http://3.83.84.211:8888",
    ordererUrl: "http://3.83.84.211:8888",
    storageUrl: "http://3.83.84.211:8081",
};

const defaultTinyliciousPort = 7070;

export const tinyliciousUrls = (options: ITinyliciousRouteOptions) => {
    const port = options.tinyliciousPort ?? defaultTinyliciousPort;

    return {
        hostUrl: `http://localhost:${port}`,
        ordererUrl: `http://localhost:${port}`,
        storageUrl: `http://localhost:${port}`,
    };
};

function getUrlResolver(options: RouteOptions): IUrlResolver {
    switch (options.mode) {
        case "docker":
            return new InsecureUrlResolver(
                dockerUrls.hostUrl,
                dockerUrls.ordererUrl,
                dockerUrls.storageUrl,
                options.tenantId,
                options.bearerSecret);

        case "r11s":
            return new InsecureUrlResolver(
                options.fluidHost,
                "http://3.83.84.211:8888",
                "http://3.83.84.211:8081",
                options.tenantId,
                options.bearerSecret);
        case "tinylicious": {
            const urls = tinyliciousUrls(options);
            return new InsecureUrlResolver(
                urls.hostUrl,
                urls.ordererUrl,
                urls.storageUrl,
                "tinylicious",
                options.bearerSecret);
        }
        case "spo":
        case "spo-df":
            return new OdspUrlResolver(
                options.server,
                { accessToken: options.odspAccessToken });

        default: // Local
            return new LocalResolver();
    }
}

export class MultiUrlResolver implements IUrlResolver {
    private readonly urlResolver: IUrlResolver;
    constructor(
        private readonly documentId: string,
        private readonly rawUrl: string,
        private readonly options: RouteOptions,
        private readonly useLocalResolver: boolean = false,
    ) {
        if (this.useLocalResolver) {
            this.urlResolver = new LocalResolver();
        } else {
            this.urlResolver = getUrlResolver(options);
        }
    }

    async getAbsoluteUrl(resolvedUrl: IResolvedUrl, relativeUrl: string): Promise<string> {
        let url = relativeUrl;
        if (url.startsWith("/")) {
            url = url.substr(1);
        }
        return `${this.rawUrl}/${this.documentId}/${url}`;
    }

    async resolve(request: IRequest): Promise<IResolvedUrl | undefined> {
        return this.urlResolver.resolve(request);
    }

    public async createRequestForCreateNew(
        fileName: string,
    ): Promise<IRequest> {
        if (this.useLocalResolver) {
            return (this.urlResolver as LocalResolver).createCreateNewRequest(fileName);
        }
        switch (this.options.mode) {
            case "r11s":
            case "docker":
            case "tinylicious":
                return (this.urlResolver as InsecureUrlResolver).createCreateNewRequest(fileName);

            case "spo":
            case "spo-df":
                return (this.urlResolver as OdspUrlResolver).createCreateNewRequest(fileName);

            default: // Local
                return (this.urlResolver as LocalResolver).createCreateNewRequest(fileName);
        }
    }
}
