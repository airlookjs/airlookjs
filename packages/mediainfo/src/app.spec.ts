import { build } from './app.js';
import request from "supertest";
import { VERSION } from './config.js';
import express  from 'express';
import fs from 'node:fs';
import { expect, describe, it, vi, afterEach, afterAll, beforeAll } from "vitest";
import { MediainfoDataResponse } from './routes.js';

const dateMatch = /\d{4}-\d{2}-\d{2}/;
const timeMatch = /\d{2}:\d{2}:\d{2}/;
const mediaInfoVersion = /\d{2}.\d{2}/;
const TEST_FILE = 'seq-3341-13-1-24bit.wav';

const routePrefix = '/api/test';

const app = await build({
  routePrefix,
  mediainfo: {
    defaultOutputFormat: 'EBUCore_JSON',
    cacheDir: '.cache/mediainfotest'
  },
  shares: [
    {
      name: 'test',
      mount: `${import.meta.dirname}/../tests`,// '../tests',
      matches: [RegExp('tests/(.*)')],
      cached: false
    },
    {
      name: 'testcached',
      mount: `${import.meta.dirname}/../tests`,// '../tests',
      matches: [RegExp('testscached/(.*)')],
      cached: true
    }
  ]});

beforeAll(async () => {
    await app.ready();
})

describe('GET /', () => {
	it('should return 200 OK', async () => {
		const res = await request(app.server).get(`${routePrefix}`);
		expect(res.status).toBe(200);
	});
});

describe('mediainfo', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('shares that are not cached', () => {

    it('should return 400 Bad Request with no query params', async () => {
        const res = await request(app.server).get(`${routePrefix}/mediainfo`);
        expect(res.status).toBe(400);
    });

    it('should return valid result for a valid file and use default output', { timeout: 10000 }, async () => {
        const res = await request(app.server).get(`${routePrefix}/mediainfo?file=tests/${TEST_FILE}`);

        expect(res.status).toBe(200);

				expect(res.body).toEqual(
					{
            cached: false,
						version: VERSION,
					  mediainfo: {
							"ebucore:ebuCoreMain": {
								"@dateLastModified": expect.stringMatching(dateMatch) as unknown,
								"@timeLastModified": expect.stringMatching(timeMatch) as unknown,
								"@version": "1.8",
								"@writingLibraryName": "MediaInfoLib",
								"@writingLibraryVersion": expect.stringMatching(mediaInfoVersion) as unknown,
								"ebucore:coreMetadata": [
									{
										"ebucore:format": [
											{
												"ebucore:audioFormat": [
													{
														"@audioFormatName": "PCM",
														"ebucore:audioEncoding": [
															{
																"@typeLabel": "PCM",
																"@typeLink": "http://www.ebu.ch/metadata/cs/ebu_AudioCompressionCodeCS.xml#11",
															},
														],
														"ebucore:bitRate": [
															{
																"#value": "2304000",
															},
														],
														"ebucore:bitRateMode": [
															{
																"#value": "constant",
															},
														],
														"ebucore:channels": [
															{
																"#value": "2",
															},
														],
														"ebucore:codec": [
															{
																"ebucore:codecIdentifier": [
																	{
																		"dc:identifier": [
																			{
																				"#value": "1",
																			},
																		],
																	},
																],
															},
														],
														"ebucore:sampleSize": [
															{
																"#value": "24",
															},
														],
														"ebucore:samplingRate": [
															{
																"#value": "48000",
															},
														],
														"ebucore:technicalAttributeInteger": [
															{
																"#value": "403200",
																"@typeLabel": "StreamSize",
																"@unit": "byte",
															},
														],
														"ebucore:technicalAttributeString": [
															{
																"#value": "Little",
																"@typeLabel": "Endianness",
															},
														],
													},
												],
												"ebucore:containerFormat": expect.any(Array) as unknown,
												"ebucore:duration": [
													{
														"ebucore:normalPlayTime": [
															{
																"#value": "PT1.400S",
															},
														],
													},
												],
												"ebucore:fileName": [
													{
														"#value": "seq-3341-13-1-24bit.wav",
													},
												],
												"ebucore:fileSize": [
													{
														"#value": "403244",
													},
												],
												"ebucore:locator": [
													{
														"#value": expect.stringMatching(new RegExp('airlookjs/packages/mediainfo/tests/seq-3341-13-1-24bit.wav')) as unknown,
													},
												],
												"ebucore:technicalAttributeInteger": [
													{
														"#value": "2304251",
														"@typeLabel": "OverallBitRate",
														"@unit": "bps",
													},
												],
											},
										],
									},
								],
							}
					},
					}
				);
    });

    it('should return valid result for a valid file and use default output', { timeout: 10000 }, async () => {
			const res = await request(app.server).get(`${routePrefix}/mediainfo?file=tests/${TEST_FILE}&outputFormat=JSON`);

      const body = res.body as MediainfoDataResponse;

			expect(res.status).toBe(200);
			expect(body.mediainfo.creatingLibrary).toEqual(
				{
				"name": "MediaInfoLib",
				"url": "https://mediaarea.net/MediaInfo",
				"version": expect.stringMatching(mediaInfoVersion) as unknown,
      })

// 				      "@ref": "/Users/drexbemh/repos/airlookjs/airlookjs/packages/mediainfo/tests/seq-3341-13-1-24bit.wav",

      expect(body.version).toEqual(VERSION);

      expect(body.mediainfo.media.track[0]).toMatchObject({
        "@type": "General",
        "AudioCount": "1",
        "Duration": "1.400",
        "FileExtension": "wav",
        "FileSize": "403244",
        "File_Modified_Date": expect.stringMatching(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC/) as unknown,
        "File_Modified_Date_Local": expect.stringMatching(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/),
        "Format": "Wave",
        //"Format_Settings": "PcmWaveformat",
        "OverallBitRate": "2304251",
        "OverallBitRate_Mode": "CBR",
        "StreamSize": "44",
      }),
      expect(body.mediainfo.media.track[1]).toEqual(
				        {
				          "@type": "Audio",
				          "BitDepth": "24",
				          "BitRate": "2304000",
				          "BitRate_Mode": "CBR",
				          "Channels": "2",
				          "CodecID": "1",
				          "Duration": "1.400",
				          "Format": "PCM",
				          "Format_Settings_Endianness": "Little",
				          "Format_Settings_Sign": "Signed",
				          "SamplingCount": "67200",
				          "SamplingRate": "48000",
				          "StreamSize": "403200",
				        },
			);
	});

    it('should return valid result for a valid file and use output from parameters', { timeout: 10000 }, async () => {
        const res = await request(app.server).get(`${routePrefix}/mediainfo?file=tests/${TEST_FILE}&outputFormat=PBCore2`);

        expect(res.status).toBe(200);

				expect(res.text).toEqual(expect.stringMatching(new RegExp('<pbcoreInstantiationDocument xsi:schemaLocation="http://www.pbcore.org/PBCore/PBCoreNamespace.html https://raw.githubusercontent.com/WGBH/PBCore_2.1/master/pbcore-2.1.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.pbcore.org/PBCore/PBCoreNamespace.html">')));
				expect(res.text).toEqual(expect.stringMatching(new RegExp('<instantiationIdentifier source="File Name">seq-3341-13-1-24bit.wav</instantiationIdentifier>')));
				expect(res.text).toEqual(expect.stringMatching(new RegExp('<essenceTrackDuration>00:00:01.400</essenceTrackDuration>')));
    });
	});

	// runs sequentially, first test writes cache file second test returns it
	describe.sequential ('shares that are cached', () => {

		afterAll(() => {
			if(fs.existsSync(`${import.meta.dirname}/../tests/.cache`)) {
				fs.rmdirSync(`${import.meta.dirname}/../tests/.cache`, {recursive: true})
			}
		});

    it('returns non cached file', { timeout: 10000 }, async () => {
			const res = await request(app.server).get(`${routePrefix}/mediainfo?file=testscached/${TEST_FILE}`);

			expect(res.status).toBe(200);
      const body = res.body as MediainfoDataResponse;

      expect(body).toMatchObject({
        cached: false,
        version: VERSION,
      });

			expect(body.mediainfo).toEqual({
						"ebucore:ebuCoreMain": {
							"@dateLastModified": expect.stringMatching(dateMatch) as unknown,
							"@timeLastModified": expect.stringMatching(timeMatch) as unknown,
							"@version": "1.8",
							"@writingLibraryName": "MediaInfoLib",
							"@writingLibraryVersion": expect.stringMatching(mediaInfoVersion) as unknown,
							"ebucore:coreMetadata": [
								{
									"ebucore:format": [
										{
											"ebucore:audioFormat": [
												{
													"@audioFormatName": "PCM",
													"ebucore:audioEncoding": [
														{
															"@typeLabel": "PCM",
															"@typeLink": "http://www.ebu.ch/metadata/cs/ebu_AudioCompressionCodeCS.xml#11",
														},
													],
													"ebucore:bitRate": [
														{
															"#value": "2304000",
														},
													],
													"ebucore:bitRateMode": [
														{
															"#value": "constant",
														},
													],
													"ebucore:channels": [
														{
															"#value": "2",
														},
													],
													"ebucore:codec": [
														{
															"ebucore:codecIdentifier": [
																{
																	"dc:identifier": [
																		{
																			"#value": "1",
																		},
																	],
																},
															],
														},
													],
													"ebucore:sampleSize": [
														{
															"#value": "24",
														},
													],
													"ebucore:samplingRate": [
														{
															"#value": "48000",
														},
													],
													"ebucore:technicalAttributeInteger": [
														{
															"#value": "403200",
															"@typeLabel": "StreamSize",
															"@unit": "byte",
														},
													],
													"ebucore:technicalAttributeString": [
														{
															"#value": "Little",
															"@typeLabel": "Endianness",
														},
													],
												},
											],
											"ebucore:containerFormat": expect.any(Array) as unknown,
											"ebucore:duration": [
												{
													"ebucore:normalPlayTime": [
														{
															"#value": "PT1.400S",
														},
													],
												},
											],
											"ebucore:fileName": [
												{
													"#value": "seq-3341-13-1-24bit.wav",
												},
											],
											"ebucore:fileSize": [
												{
													"#value": "403244",
												},
											],
											"ebucore:locator": [
												{
													"#value": expect.stringMatching(new RegExp('airlookjs/packages/mediainfo/tests/seq-3341-13-1-24bit.wav')) as unknown,
												},
											],
											"ebucore:technicalAttributeInteger": [
												{
													"#value": "2304251",
													"@typeLabel": "OverallBitRate",
													"@unit": "bps",
												},
											],
										},
									],
								},
							],
						}
				}
			);
    });

    it('returns cached file', { timeout: 10000 }, async () => {
			const res = await request(app.server).get(`${routePrefix}/mediainfo?file=testscached/${TEST_FILE}`);

			expect(res.status).toBe(200);

			expect(res.body).toEqual(
				{
					cached: true,
					version: VERSION,
					mediainfo: {
						"ebucore:ebuCoreMain": {
							"@dateLastModified": expect.stringMatching(dateMatch) as unknown,
							"@timeLastModified": expect.stringMatching(timeMatch) as unknown,
							"@version": "1.8",
							"@writingLibraryName": "MediaInfoLib",
							"@writingLibraryVersion": expect.stringMatching(mediaInfoVersion) as unknown,
							"ebucore:coreMetadata": [
								{
									"ebucore:format": [
										{
											"ebucore:audioFormat": [
												{
													"@audioFormatName": "PCM",
													"ebucore:audioEncoding": [
														{
															"@typeLabel": "PCM",
															"@typeLink": "http://www.ebu.ch/metadata/cs/ebu_AudioCompressionCodeCS.xml#11",
														},
													],
													"ebucore:bitRate": [
														{
															"#value": "2304000",
														},
													],
													"ebucore:bitRateMode": [
														{
															"#value": "constant",
														},
													],
													"ebucore:channels": [
														{
															"#value": "2",
														},
													],
													"ebucore:codec": [
														{
															"ebucore:codecIdentifier": [
																{
																	"dc:identifier": [
																		{
																			"#value": "1",
																		},
																	],
																},
															],
														},
													],
													"ebucore:sampleSize": [
														{
															"#value": "24",
														},
													],
													"ebucore:samplingRate": [
														{
															"#value": "48000",
														},
													],
													"ebucore:technicalAttributeInteger": [
														{
															"#value": "403200",
															"@typeLabel": "StreamSize",
															"@unit": "byte",
														},
													],
													"ebucore:technicalAttributeString": [
														{
															"#value": "Little",
															"@typeLabel": "Endianness",
														},
													],
												},
											],
											"ebucore:containerFormat": expect.any(Array) as unknown,
											"ebucore:duration": [
												{
													"ebucore:normalPlayTime": [
														{
															"#value": "PT1.400S",
														},
													],
												},
											],
											"ebucore:fileName": [
												{
													"#value": "seq-3341-13-1-24bit.wav",
												},
											],
											"ebucore:fileSize": [
												{
													"#value": "403244",
												},
											],
											"ebucore:locator": [
												{
													"#value": expect.stringMatching(new RegExp('airlookjs/packages/mediainfo/tests/seq-3341-13-1-24bit.wav')) as unknown,
												},
											],
											"ebucore:technicalAttributeInteger": [
												{
													"#value": "2304251",
													"@typeLabel": "OverallBitRate",
													"@unit": "bps",
												},
											],
										},
									],
								},
							],
						}
				}
			 }
			);
    });
  });

	describe('download file over url', ()  => {

		let staticServer: express.Express;
    beforeAll(() => {
			staticServer = express();
			// Setup express static middleware to look for files in the api directory for all requests starting with /api
			staticServer.use(`/notmounted`, express.static(`${import.meta.dirname}/../tests`) , function(_req, res){
				// Optional 404 handler
				res.status(404);
				res.json({error:{code:404}})
			});

			staticServer.listen('9090');
		});

		it('should return 200 OK', async () => {
			const res = await request(app.server).get(`${routePrefix}/mediainfo?file=http://127.0.0.1:9090/notmounted/${TEST_FILE}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				{
          "cached": false,
					"version": VERSION,
				  "mediainfo": {
				    "ebucore:ebuCoreMain": {
							"@dateLastModified": expect.stringMatching(dateMatch) as unknown,
							"@timeLastModified": expect.stringMatching(timeMatch) as unknown,
							"@version": "1.8",
							"@writingLibraryName": "MediaInfoLib",
							"@writingLibraryVersion": expect.stringMatching(mediaInfoVersion) as unknown,
							"ebucore:coreMetadata": [
								{
									"ebucore:format": [
										{
											"ebucore:audioFormat": [
												{
													"@audioFormatName": "PCM",
													"ebucore:audioEncoding": [
														{
															"@typeLabel": "PCM",
															"@typeLink": "http://www.ebu.ch/metadata/cs/ebu_AudioCompressionCodeCS.xml#11",
														},
													],
													"ebucore:bitRate": [
														{
															"#value": "2304000",
														},
													],
													"ebucore:bitRateMode": [
														{
															"#value": "constant",
														},
													],
													"ebucore:channels": [
														{
															"#value": "2",
														},
													],
													"ebucore:codec": [
														{
															"ebucore:codecIdentifier": [
																{
																	"dc:identifier": [
																		{
																			"#value": "1",
																		},
																	],
																},
															],
														},
													],
													"ebucore:sampleSize": [
														{
															"#value": "24",
														},
													],
													"ebucore:samplingRate": [
														{
															"#value": "48000",
														},
													],
													"ebucore:technicalAttributeInteger": [
														{
															"#value": "403200",
															"@typeLabel": "StreamSize",
															"@unit": "byte",
														},
													],
													"ebucore:technicalAttributeString": [
														{
															"#value": "Little",
															"@typeLabel": "Endianness",
														},
													],
												},
											],
											"ebucore:containerFormat": expect.any(Array) as unknown,
											"ebucore:duration": [
												{
													"ebucore:normalPlayTime": [
														{
															"#value": "PT1.400S",
														},
													],
												},
											],
											"ebucore:fileName": [
												{
													"#value": expect.stringContaining("seq-3341-13-1-24bit.wav") as unknown,
												},
											],
											"ebucore:fileSize": [
												{
													"#value": "403244",
												},
											],
											"ebucore:locator": [
												{
													"#value": expect.stringContaining("-seq-3341-13-1-24bit.wav") as unknown,
												},
											],
											"ebucore:technicalAttributeInteger": [
												{
													"#value": "2304251",
													"@typeLabel": "OverallBitRate",
													"@unit": "bps",
												},
											],
										},
									],
								},
							],
						}
				  },
				}
			);
		});
	});

    // TODO: test multiple shares

});
