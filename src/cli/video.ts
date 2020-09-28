// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./shims.d.ts" />

import { path } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(path);

export interface IVideoOptions {
  fps?: number;
}

export function concatPNGImages(input: string, output: string, { fps = 1 }: IVideoOptions = {}) {
  return new Promise((resolve) => {
    const command = ffmpeg();
    // Use FFMpeg to create a video.

    command.input(input);
    command.output(output);
    command.outputFPS(fps);

    command.noAudio();
    command.on('exit', resolve);
    command.run();
  });
}
