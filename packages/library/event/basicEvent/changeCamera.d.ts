import { BasicEventConfig, EventGenerator } from "@vis-three/middleware";
export interface ChangeCamera extends BasicEventConfig {
    params: {
        camera: string;
        delay: number;
    };
}
export declare const config: ChangeCamera;
export declare const generator: EventGenerator<ChangeCamera>;
