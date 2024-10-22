import { config } from "@kwiz/common";
import { BuildNumber, ReleaseStatus } from "./constants";

export const { logger: GetLogger } = config({
    BuildNumber: BuildNumber,
    IsLocalDev: false,
    ReleaseStatus: ReleaseStatus,
    ProjectName: "[fluentui]"
});
