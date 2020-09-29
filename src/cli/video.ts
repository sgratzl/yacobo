// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./shims.d.ts" />

import { path } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(path);

export interface IVideoOptions {
  fps?: number;
  size?: [number, number];
}

export function concatPNGImages(input: string, output: string, { fps = 1, size }: IVideoOptions = {}) {
  return new Promise((resolve) => {
    const command = ffmpeg();
    // Use FFMpeg to create a video.

    command.input(input);
    command.output(output);
    command.inputFPS(fps);
    // command.addOutput(output.replace('.mp4', '.webm'));
    // } else {
    //   command.outputFPS(fps);
    // }

    if (size) {
      command.videoFilter(`pad=w=${size[0]}:h=${size[1]}:color=white`);
    }
    // command.videoCodec('libx264');

    command.noAudio();
    command.on('end', resolve);
    // console.log(command._getArguments());
    command.run();
  });
}

export function stackVideos(inputs: string[], output: string) {
  return new Promise((resolve) => {
    const command = ffmpeg();
    // Use FFMpeg to create a video.

    for (const input of inputs) {
      command.input(input);
    }
    command.output(output);
    command.complexFilter([
      {
        filter: 'xstack',
        options: 'inputs=6:layout=0_0|0_h0|w0_0|w0_h0|w0+w1_0|w0+w1_h0',
      },
    ]);

    command.noAudio();
    command.on('exit', resolve);
    // console.log(`${path} ${command._getArguments().join(' ')}`);
    command.run();
  });
}
