/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { bufferToString, toUtf8 } from "@fluidframework/common-utils";
import { IDocumentAttributes, ISequencedDocumentMessage } from "@fluidframework/protocol-definitions";
import { convertWholeFlatSummaryToSnapshotTreeAndBlobs, IGitManager } from "@fluidframework/server-services-client";
import { IDeliState } from "@fluidframework/server-services-core";
import {
    CommonProperties,
    getLumberBaseProperties,
    LumberEventName,
    Lumberjack,
} from "@fluidframework/server-services-telemetry";
import { ILatestSummaryState, ISummaryReader } from "./interfaces";

/**
 * Git specific implementation of ISummaryReader
 */
export class SummaryReader implements ISummaryReader {
    private readonly lumberProperties: Record<string, any>;
    constructor(
        private readonly tenantId: string,
        private readonly documentId: string,
        private readonly summaryStorage: IGitManager,
        private readonly enableWholeSummaryUpload: boolean,
    ) {
        this.lumberProperties = getLumberBaseProperties(this.documentId, this.tenantId);
    }

    /**
    * Reads the most recent version of summary for a document. In case the storage is having trouble processing the
    * request, returns a set of defaults with fromSummary flag set to false.
    */
    public async readLastSummary(): Promise<ILatestSummaryState> {
        const summaryReaderMetric = Lumberjack.newLumberMetric(LumberEventName.SummaryReader);
        summaryReaderMetric.setProperties(this.lumberProperties);

        if (this.enableWholeSummaryUpload) {
            try {
                const existingRef = await this.summaryStorage.getRef(encodeURIComponent(this.documentId));
                const wholeFlatSummary = await this.summaryStorage.getSummary(existingRef.object.sha);
                const normalizedSummary = convertWholeFlatSummaryToSnapshotTreeAndBlobs(wholeFlatSummary);

                // Obtain IDs of specific fields from the downloaded summary
                const attributesBlobId = normalizedSummary.snapshotTree.trees[".protocol"]?.blobs?.attributes;
                const scribeBlobId = normalizedSummary.snapshotTree.trees[".serviceProtocol"]?.blobs?.scribe;
                const deliBlobId = normalizedSummary.snapshotTree.trees[".serviceProtocol"]?.blobs?.deli;
                const opsBlobId = normalizedSummary.snapshotTree.trees[".logTail"]?.blobs?.logTail;

                // Parse specific fields from the downloaded summary
                const attributesContent = attributesBlobId ? normalizedSummary.blobs.get(attributesBlobId) : undefined;
                const scribeContent = scribeBlobId ? normalizedSummary.blobs.get(scribeBlobId) : undefined;
                const deliContent = deliBlobId ? normalizedSummary.blobs.get(deliBlobId) : undefined;
                const opsContent = opsBlobId ? normalizedSummary.blobs.get(opsBlobId) : undefined;

                const attributes = attributesContent ?
                    JSON.parse(bufferToString(attributesContent, "utf8")) as IDocumentAttributes :
                    this.getDefaultAttributes();
                const scribe = scribeContent ? bufferToString(scribeContent, "utf8") : this.getDefaultScribe();
                const deli = deliContent ?
                    JSON.parse(bufferToString(deliContent, "utf8")) as IDeliState :
                    this.getDefaultDeli();
                const term = deli.term;
                const messages = opsContent ?
                    JSON.parse(bufferToString(opsContent, "utf8")) as ISequencedDocumentMessage[] :
                    this.getDefaultMesages();

                summaryReaderMetric.setProperties({
                    [CommonProperties.minLogtailSequenceNumber]: Math.min(...messages.map(
                        (message) => message.sequenceNumber)),
                    [CommonProperties.maxLogtailSequenceNumber]: Math.max(...messages.map(
                        (message) => message.sequenceNumber)),
                    [CommonProperties.lastSummarySequenceNumber]: deli.sequenceNumber,
                    [CommonProperties.clientCount]: deli.clients?.length,
                });

                summaryReaderMetric.success(`Successfully read whole summary`);

                return {
                    term,
                    protocolHead: attributes.sequenceNumber,
                    scribe,
                    messages,
                    fromSummary: true,
                };
            } catch (error: any) {
                summaryReaderMetric.error(`Returning default summary due to error when reading whole summary`, error);
                return this.getDefaultSummaryState();
            }
        } else {
            try {
                const existingRef = await this.summaryStorage.getRef(encodeURIComponent(this.documentId));
                const [attributesContent, scribeContent, deliContent, opsContent] = await Promise.all([
                    this.summaryStorage.getContent(existingRef.object.sha, ".protocol/attributes")
                        .catch(() => undefined),
                    this.summaryStorage.getContent(existingRef.object.sha, ".serviceProtocol/scribe")
                        .catch(() => undefined),
                    this.summaryStorage.getContent(existingRef.object.sha, ".serviceProtocol/deli")
                        .catch(() => undefined),
                    this.summaryStorage.getContent(existingRef.object.sha, ".logTail/logTail")
                        .catch(() => undefined),
                ]);

                const attributes = attributesContent ?
                    JSON.parse(toUtf8(attributesContent.content, attributesContent.encoding)) as IDocumentAttributes :
                    this.getDefaultAttributes();
                const scribe = scribeContent ?
                    toUtf8(scribeContent.content, scribeContent.encoding) :
                    this.getDefaultScribe();
                const deli = deliContent ?
                    JSON.parse(toUtf8(deliContent.content, deliContent.encoding)) as IDeliState :
                    this.getDefaultDeli();
                const term = deli.term;
                const messages = opsContent ?
                    JSON.parse(toUtf8(opsContent.content, opsContent.encoding)) as ISequencedDocumentMessage[] :
                    this.getDefaultMesages();

                summaryReaderMetric.setProperties({
                    [CommonProperties.minLogtailSequenceNumber]: Math.min(...messages.map(
                        (message) => message.sequenceNumber)),
                    [CommonProperties.maxLogtailSequenceNumber]: Math.max(...messages.map(
                        (message) => message.sequenceNumber)),
                    [CommonProperties.lastSummarySequenceNumber]: deli.sequenceNumber,
                    [CommonProperties.clientCount]: deli.clients?.length,
                });

                summaryReaderMetric.success(`Successfully read summary`);

                return {
                    term,
                    protocolHead: attributes.sequenceNumber,
                    scribe,
                    messages,
                    fromSummary: true,
                };
            } catch (error: any) {
                summaryReaderMetric.error(`Returning default summary due to error when reading summary`, error);
                return this.getDefaultSummaryState();
            }
        }
    }

    private getDefaultSummaryState(): ILatestSummaryState {
        return {
            term: 1,
            protocolHead: 0,
            scribe: "",
            messages: [],
            fromSummary: false,
        };
    }

    private getDefaultAttributes(): IDocumentAttributes {
        Lumberjack.info("Using default attributes when reading summary.", this.lumberProperties);
        return {
            sequenceNumber: 0,
            minimumSequenceNumber: 0,
            term: undefined,
        };
    }

    private getDefaultScribe(): string {
        Lumberjack.info("Using default scribe when reading summary.", this.lumberProperties);
        return "";
    }

    private getDefaultDeli(): IDeliState {
        Lumberjack.info("Using default deli state when reading summary.", this.lumberProperties);
        return {
            clients: undefined,
            durableSequenceNumber: 0,
            logOffset: 0,
            sequenceNumber: 0,
            expHash1: "",
            epoch: 0,
            term: 1,
            lastSentMSN: undefined,
            nackMessages: undefined,
            successfullyStartedLambdas: [],
        };
    }

    private getDefaultMesages(): ISequencedDocumentMessage[] {
        Lumberjack.info("Using default messages when reading summary.", this.lumberProperties);
        return [];
    }
}
