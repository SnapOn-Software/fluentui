import { CommonConfig, GetLogger } from '@kwiz/common';

export * from './controls';
export * from './helpers';
export * from './styles';


const logger = new GetLogger("fluentui");
export function printInfo() {
    logger.i.log(CommonConfig.i);
}