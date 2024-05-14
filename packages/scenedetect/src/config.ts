import { parseIntEnv, type ShareInfo } from '@airlookjs/shared';
import dotenv from 'dotenv';
dotenv.config();

//import { ShareInfo } from '../../libs/common/config';
export interface SceneDetectConfig {
	environment: string;
	route: string;
	shares: ShareInfo[];
	version: string;
	port: number;
}

export const config: SceneDetectConfig = {
	environment: process.env.NODE_ENV ?? 'development',
	version: process.env.npm_package_version ?? 'dev',
	port: parseIntEnv(process.env.PORT, 3000),
	route: process.env.ROUTE ?? '/api/scenedetect',
	shares: []
};
