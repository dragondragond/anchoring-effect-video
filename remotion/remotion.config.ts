import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(8);
// 预览服务偶尔收不到文件变化（改了代码还是旧画面），改用轮询保证每次改动都会重新打包
Config.setWebpackPollingInMilliseconds(1000);
