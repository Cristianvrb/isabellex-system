import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegStatic);
const videoPath = path.join(process.cwd(), 'drive_videos', '1774164819239-ISABELEXIA_1.0.mp4');
const mp3Path = videoPath.replace('.mp4', '.mp3');

console.log('Testando ffmpeg local...');
ffmpeg(videoPath)
  .outputOptions('-vn', '-ab', '128k', '-ar', '44100')
  .save(mp3Path)
  .on('end', () => console.log('SUCESSO NO FFMPEG! O problema não é aqui.'))
  .on('error', (err) => console.log('ERRO NO FFMPEG:', err.message));
