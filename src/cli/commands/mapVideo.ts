// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../shims.d.ts" />

import { path } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(path);

export function run() {
  // const command = ffmpeg();
  // // Use FFMpeg to create a video.
  // // 8 consecutive frames, held for 5 seconds each, 30fps output, no audio
  // command
  //   .input('assets/demo1/Sinewave3-1920x1080_%03d.png')
  //   .inputFPS(1 / 5)
  //   .output('assets/demo1/Sinewave3-1920x1080.mp4')
  //   .outputFPS(30)
  //   .noAudio()
  //   .run();
}
