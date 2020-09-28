// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./shims.d.ts" />

import { path } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(path);

export function concatPNGImages(input: string, output: string) {
  return new Promise((resolve) => {
    const command = ffmpeg();
    // Use FFMpeg to create a video.
    // 8 consecutive frames, held for 5 seconds each, 30fps output, no audio
    command.input(input).inputFPS(1).output(output).outputFPS(1).noAudio().on('exit', resolve).run();
  });
}
