import {} from "mocha";
import {assert} from 'chai';
import * as mm from '../src';
import * as fs from 'fs-extra';
import * as path from 'path';

const t = assert;

describe("FLAC decoding", () => {

  const filename = 'flac.flac';
  const filePath = path.join(__dirname, 'samples', filename);

  function checkFormat(format) {
    t.strictEqual(format.dataformat, 'flac', 'format.tag_type');
    t.strictEqual(format.headerType, 'vorbis', 'format.tag_type');
    t.strictEqual(format.duration, 271.7733333333333, 'format.duration');
    t.strictEqual(format.sampleRate, 44100, 'format.sampleRate = 44.1 kHz');
    t.strictEqual(format.bitsPerSample, 16, 'format.bitsPerSample = 16 bit');
    t.strictEqual(format.numberOfChannels, 2, 'format.numberOfChannels 2 (stereo)');
  }

  function checkCommon(common) {
    t.strictEqual(common.title, 'Brian Eno', 'common.title');
    t.deepEqual(common.artists, ['MGMT'], 'common.artist');
    t.strictEqual(common.albumartist, undefined, 'common.albumartist');
    t.strictEqual(common.album, 'Congratulations', 'common.album');
    t.strictEqual(common.year, 2010, 'common.year');
    t.deepEqual(common.track, {no: 7, of: null}, 'common.track');
    t.deepEqual(common.disk, {no: null, of: null}, 'common.disk');
    t.deepEqual(common.genre, ['Alt. Rock'], 'genre');
    t.strictEqual(common.picture[0].format, 'jpg', 'common.picture format');
    t.strictEqual(common.picture[0].data.length, 175668, 'common.picture length');
  }

  function checkNative(vorbis) {
    // Compare expectedCommonTags with result.common
    t.deepEqual(vorbis.TITLE, ['Brian Eno'], 'vorbis.TITLE');
    t.deepEqual(vorbis.ARTIST, ['MGMT'], 'vorbis.ARTIST');
    t.deepEqual(vorbis.DATE, ['2010'], 'vorbis.DATE');
    t.deepEqual(vorbis.TRACKNUMBER, ['07'], 'vorbis.TRACKNUMBER');
    t.deepEqual(vorbis.GENRE, ['Alt. Rock'], 'vorbis.GENRE');
    t.deepEqual(vorbis.COMMENT, ['EAC-Secure Mode'], 'vorbis.COMMENT');
    const pic = vorbis.METADATA_BLOCK_PICTURE[0];

    t.strictEqual(pic.type, 'Cover (front)', 'raw METADATA_BLOCK_PICTUREtype');
    t.strictEqual(pic.format, 'image/jpeg', 'raw METADATA_BLOCK_PICTURE format');
    t.strictEqual(pic.description, '', 'raw METADATA_BLOCK_PICTURE description');
    t.strictEqual(pic.width, 450, 'raw METADATA_BLOCK_PICTURE width');
    t.strictEqual(pic.height, 450, 'raw METADATA_BLOCK_PICTURE height');
    t.strictEqual(pic.colour_depth, 24, 'raw METADATA_BLOCK_PICTURE colour depth');
    t.strictEqual(pic.indexed_color, 0, 'raw METADATA_BLOCK_PICTURE indexed_color');
    t.strictEqual(pic.data.length, 175668, 'raw METADATA_BLOCK_PICTURE length');
  }

  it("should decode a FLAC audio file (.flac)", () => {

    return mm.parseFile(filePath, {native: true}).then((metadata) => {
      checkFormat(metadata.format);
      checkCommon(metadata.common);
      checkNative(mm.orderTags(metadata.native.vorbis));
    });

  });

  it("should decode from a FLAC audio stream (audio/flac)", () => {

    const stream = fs.createReadStream(filePath);

    return mm.parseStream(stream, 'audio/flac', {native: true}).then((metadata) => {
      checkFormat(metadata.format);
      checkCommon(metadata.common);
      checkNative(mm.orderTags(metadata.native.vorbis));
    }).then(() => {
      stream.close();
    });

  });

});
