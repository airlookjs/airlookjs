import { server } from './server.js';
import request from "supertest";
import express, { type Express } from "express";
import * as configExports from './config.js';
import fs from 'fs';
import { expect, describe, it, vi, beforeEach, afterEach, afterAll } from "vitest";

const dateMatch = /\d{4}-\d{2}-\d{2}/;
const timeMatch = /\d{2}:\d{2}:\d{2}/;
const mediaInfoVersion = /\d{2}.\d{2}/;
const TEST_FILE = 'seq-3341-13-1-24bit.wav'; 
const version = '1.0'

const defaultConfig = {
	port: 8080,
	route: '/api/mediainfo',
	defaultOutputFormatName: 'EBUCore_JSON',
	version,
	shares: [],
}

describe('GET /', () => {
	it('should return 200 OK', async () => {
		const res = await request(server).get('/');
		expect(res.status).toBe(200);
	});
});


describe('mediainfo', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('shares that are not cached', () => {
		beforeEach(() => {
			vi.spyOn(configExports, 'config', 'get').mockReturnValue({
				...defaultConfig,
				shares: [
					{
						name: 'test',
						mount: `${import.meta.dirname}/../tests`,// '../tests',
						matches: [RegExp('tests/(.*)')],
						cached: false,
						uncRoot: '',
						systemRoot: '',
					}
				]
			});
		});

    it('should return 400 Bad Request with no query params', async () => {
        const res = await request(server).get('/api/mediainfo');
        expect(res.status).toBe(400);
    });

    it('should return valid result for a valid file and use default output', { timeout: 10000 }, async () => {
        const res = await request(server).get(`/api/mediainfo?file=tests/${TEST_FILE}`);

        expect(res.status).toBe(200);

				expect(res.body).toEqual(
					{
						"version": '1.0',
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
			const res = await request(server).get(`/api/mediainfo?file=tests/${TEST_FILE}&outputFormat=JSON`);

			expect(res.status).toBe(200);

			expect(res.body).toEqual(
				{
				  "mediainfo": {
				    "creatingLibrary": {
				      "name": "MediaInfoLib",
				      "url": "https://mediaarea.net/MediaInfo",
				      "version": "24.05",
				    },
				    "media": {
				      "@ref": "/Users/drexbemh/repos/airlookjs/airlookjs/packages/mediainfo/tests/seq-3341-13-1-24bit.wav",
				      "track": [
				        {
				          "@type": "General",
				          "AudioCount": "1",
				          "Duration": "1.400",
				          "FileExtension": "wav",
				          "FileSize": "403244",
				          "File_Modified_Date": "2024-06-04 15:04:12 UTC",
				          "File_Modified_Date_Local": "2024-06-04 17:04:12",
				          "Format": "Wave",
				          "Format_Settings": "PcmWaveformat",
				          "OverallBitRate": "2304251",
				          "OverallBitRate_Mode": "CBR",
				          "StreamSize": "44",
				        },
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
				      ],
				    },
				  },
				  "version": "1.0",
				}
			);
	});

    it('should return valid result for a valid file and use output from parameters', { timeout: 10000 }, async () => {
        const res = await request(server).get(`/api/mediainfo?file=tests/${TEST_FILE}&outputFormat=PBCore2`);

        expect(res.status).toBe(200);

				expect(res.text).toEqual(expect.stringMatching(new RegExp('<pbcoreInstantiationDocument xsi:schemaLocation="http://www.pbcore.org/PBCore/PBCoreNamespace.html https://raw.githubusercontent.com/WGBH/PBCore_2.1/master/pbcore-2.1.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.pbcore.org/PBCore/PBCoreNamespace.html">')));
				expect(res.text).toEqual(expect.stringMatching(new RegExp('<instantiationIdentifier source="File Name">seq-3341-13-1-24bit.wav</instantiationIdentifier>')));
				expect(res.text).toEqual(expect.stringMatching(new RegExp('<essenceTrackDuration>00:00:01.400</essenceTrackDuration>')));
    });
	});

	// runs sequentially, first test writes cache file second test returns it
	describe.sequential ('shares that are cached', () => {
		beforeEach(() => {
			vi.spyOn(configExports, 'config', 'get').mockReturnValue({
				...defaultConfig,
				shares: [
					{
						name: 'test',
						mount: `${import.meta.dirname}/../tests`,// '../tests',
						matches: [RegExp('tests/(.*)')],
						cached: true,
						uncRoot: '',
						systemRoot: '',
					}
				]
			});
		});

		afterAll(() => {
			if(fs.existsSync(`${import.meta.dirname}/../tests/.cache`)) {
				fs.rmdirSync(`${import.meta.dirname}/../tests/.cache`, {recursive: true})
			}
		});

    it('returns non cached file', { timeout: 10000 }, async () => {
			const res = await request(server).get(`/api/mediainfo?file=tests/${TEST_FILE}`);

			expect(res.status).toBe(200);

			expect(res.body).toEqual(
				{
					version: '1.0',
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

    it('returns cached file', { timeout: 10000 }, async () => {
			const res = await request(server).get(`/api/mediainfo?file=tests/${TEST_FILE}`);

			expect(res.status).toBe(200);

			expect(res.body).toEqual(
				{
					cached: true,
					version: '1.0',
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
		let app: Express;
		beforeEach(() => {
			vi.spyOn(configExports, 'config', 'get').mockReturnValue({
				...defaultConfig,
				shares: [
					{
						name: 'no-mount-just-http',
						mount: ``,
						matches: [],
						cached: false,
						uncRoot: '',
						systemRoot: '',
					}
				]
			});

			app = express();
			// Setup express static middleware to look for files in the api directory for all requests starting with /api
			app.use(`/tests`, express.static(`${import.meta.dirname}/../tests`) , function(_req, res){
				// Optional 404 handler
				res.status(404);
				res.json({error:{code:404}})
			});

			app.listen('9090');
		});

		it('should return 200 OK', async () => {
			const res = await request(server).get(`/api/mediainfo?file=http://127.0.0.1:9090/tests/${TEST_FILE}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				{
					"version": '1.0',
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
													"#value": "http://127.0.0.1:9090/tests/seq-3341-13-1-24bit.wav",
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
