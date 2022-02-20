import { EventDispatcher, BaseEvent } from './../core/EventDispatcher';
import { Loader } from "three";
export interface LoadDetail {
    url: string;
    progress: number;
    error: boolean;
    message: string;
}
export interface LoadingEvent extends BaseEvent {
    loadTotal: number;
    loadSuccess: number;
    loadError: number;
}
export interface DetailEvent extends BaseEvent {
    detail: LoadDetail;
}
export interface LoadedEvent extends BaseEvent {
    loadTotal: number;
    loadSuccess: number;
    loadError: number;
    resourceMap: Map<string, unknown>;
}
export interface LoaderManagerParameters {
    loaderExtends: {
        [key: string]: Loader;
    };
}
export declare class LoaderManager extends EventDispatcher {
    private resourceMap;
    private loaderMap;
    private loadTotal;
    private loadSuccess;
    private loadError;
    private isError;
    private isLoading;
    private isLoaded;
    private loadDetailMap;
    constructor(parameters?: LoaderManagerParameters);
    private loaded;
    private checkLoaded;
    load(urlList: Array<string>): this;
    reset(): this;
    register(ext: string, loader: Loader): this;
    hasLoaded(url: string): boolean;
    getResource(url: string): unknown;
    getLoadDetailMap(): {
        [key: string]: LoadDetail;
    };
    setLoadDetailMap(map: {
        [key: string]: LoadDetail;
    }): this;
    dispose(): this;
}
