import { ModelingEngine } from "../../main";
import { DataSupportManager } from "../../manager/DataSupportManager";
import { ResourceManager } from "../../manager/ResourceManager";
import { CameraCompiler } from "../camera/CameraCompiler";
import { CameraDataSupport } from "../camera/CameraDataSupport";
import { MODULETYPE } from "../common/CommonConfig";
import { GeometryCompiler } from "../geometry/GeometryCompiler";
import { GeometryDataSupport } from "../geometry/GeometryDataSupport";
import { LightCompiler } from "../light/LightCompiler";
import { LightDataSupport } from "../light/LightDataSupport";
import { MaterialCompiler } from "../material/MaterialCompiler";
import { MaterialDataSupport } from "../material/MaterialDataSupport";
import { ModelCompiler } from "../model/ModelCompiler";
import { ModelDataSupport } from "../model/ModelDataSupport";
import { TextureCompiler } from "../texture/TextureCompiler";
import { TextureDataSupport } from "../texture/TextureDataSupport";
export interface ModelingEngineSupportParameters {
  dom?: HTMLElement
  dataSupportManager: DataSupportManager
  resourceManager: ResourceManager
}

export class ModelingEngineSupport extends ModelingEngine {

  private textureCompiler: TextureCompiler
  private materialCompiler: MaterialCompiler
  private cameraCompiler: CameraCompiler
  private lightCompiler: LightCompiler
  private modelCompiler: ModelCompiler
  private geometryCompiler: GeometryCompiler

  private resourceManager: ResourceManager
  private dataSupportManager: DataSupportManager

  constructor (parameters: ModelingEngineSupportParameters) {
    super(parameters.dom)

    const dataSupportManager = parameters.dataSupportManager
    const textureDataSupport = dataSupportManager.getDataSupport(MODULETYPE.TEXTURE)! as TextureDataSupport
    const materialDataSupport = dataSupportManager.getDataSupport(MODULETYPE.MATERIAL)! as MaterialDataSupport
    const cameraDataSupport = dataSupportManager.getDataSupport(MODULETYPE.CAMERA)! as CameraDataSupport
    const lightDataSupport =  dataSupportManager.getDataSupport(MODULETYPE.LIGHT)! as LightDataSupport
    const geometryDataSupport =  dataSupportManager.getDataSupport(MODULETYPE.GEOMETRY)! as GeometryDataSupport
    const modelDataSupport =  dataSupportManager.getDataSupport(MODULETYPE.MODEL)! as ModelDataSupport


    const textureCompiler = new TextureCompiler({
      target: textureDataSupport.getData()
    })

    const materialCompiler = new MaterialCompiler({
      target: materialDataSupport.getData()
    })

    const cameraCompiler = new CameraCompiler({
      target: cameraDataSupport.getData()
    })

    const lightCompiler = new LightCompiler({
      scene: this.scene,
      target: lightDataSupport.getData()
    })

    const geometryCompiler = new GeometryCompiler({
      target: geometryDataSupport.getData()
    })

    const modelCompiler = new ModelCompiler({
      scene: this.scene,
      target: modelDataSupport.getData()
    })

    const resourceManager = parameters.resourceManager

    // 建立编译器链接
    materialCompiler.linkTextureMap(textureCompiler.getMap())
    modelCompiler.linkGeometryMap(geometryCompiler.getMap())
    modelCompiler.linkMaterialMap(materialCompiler.getMap())

    textureCompiler.linkRescourceMap(resourceManager.getMappingResourceMap())
    geometryCompiler.linkRescourceMap(resourceManager.getMappingResourceMap())

    // 添加通知
    textureDataSupport.addCompiler(textureCompiler)
    materialDataSupport.addCompiler(materialCompiler)
    cameraDataSupport.addCompiler(cameraCompiler)
    lightDataSupport.addCompiler(lightCompiler)
    geometryDataSupport.addCompiler(geometryCompiler)
    modelDataSupport.addCompiler(modelCompiler)

    this.textureCompiler = textureCompiler
    this.materialCompiler = materialCompiler
    this.cameraCompiler = cameraCompiler
    this.lightCompiler = lightCompiler
    this.modelCompiler = modelCompiler
    this.geometryCompiler = geometryCompiler

    this.dataSupportManager = parameters.dataSupportManager
    this.resourceManager = parameters.resourceManager
  }
}