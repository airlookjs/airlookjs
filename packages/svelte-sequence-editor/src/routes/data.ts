export const sampleData1 = {
	duration: 20000,
	layers: [
		{
			key: 'layer1',
			blocks: [
				{
					key: 'block1',
					validations: {
						duration: {
							min: 4000
						}
						/*inTime: {
                        fixed: 1000
                    }*/
					},
					layers: [
						{
							key: 'layer1',
							blocks: [
								{
									key: 'block1',
									validations: {
										duration: {
											min: 8000
										}
									}
								},
								{
									key: 'block2',
									validations: {
										duration: {
											min: 1000
										}
									}
								}
							]
						},
						{
							key: 'layer2',
							blocks: [
								{
									key: 'block1',
									validations: {
										duration: {
											min: 1000
										}
									},
									layers: [
										{
											key: 'layer1',
											blocks: [
												{
													key: 'block1',
													validations: {
														duration: {
															min: 6000
														}
													}
												}
											]
										}
									]
								},
								{
									key: 'block2',
									validations: {
										duration: {
											min: 1000
										}
									}
								}
							]
						}
					]
				},
				{
					key: 'block2',
					validations: {
						/*duration: {
							fixed: 3000
						},
						inTime: {
							fixed: 1000
						}*/
					}
				}
			]
		}
	]
};

export const sampleData2 = {
	duration: 20000,
	layers: [
		{
			key: 'layer1',
			blocks: [
				{
					key: 'block1',
					validations: {
						duration: {
							min: 4000
						}
						/*inTime: {
                        fixed: 1000
                    }*/
					}
				},
				{
					key: 'block2',
					validations: {
						duration: {
							min: 6000
						}
					},
					layers: [
						{
							key: 'layer1',
							blocks: [
								{
									key: 'block1'
								},
								{
									key: 'block2'
								}
							]
						},
						{
							key: 'layer2',
							blocks: [
								{
									key: 'block1'
								},
								{
									key: 'block2',
									layers: [
										{
											key: 'layer1',
											blocks: [
												{
													key: 'block1'
												},
												{
													key: 'block2'
												}
											]
										}
									]
								}
							]
						}
					]
				},
				{
					key: 'block3',
					validations: {
						duration: {
							min: 6000
						}
					},
					layers: [
						{
							key: 'layer1',
							blocks: [
								{
									key: 'block1'
								},
								{
									key: 'block2'
								}
							]
						}
					]
				}
			]
		}
	]
};

/*
export const sampleData1 = {
    duration: 20000,
    layers: [
        {
            key: "overlays",
            blocks: []
        },
        {
            key: "titles",
            blocks: [{
                key: "title1",
                validations: {
                    duration: {
                        fixed: 3000
                    },
                    inTime: {
                        fixed: 1000
                    }
                }
            },
            {
                key: "title2",
                validations: {
                    duration: {
                        max: 3000
                    },
                    inTime: {
                        fixed: {
                            ref: 'footage.footage1.outTime'
                        }
                    }
                }
            },
            {
                key: "title3",
                layers: [
                    {
                        key: "title3-1",
                        blocks: [{
                            key: "spacebefore",
                            validations: {
                                duration: {
                                    fixed: 1000
                                },
                            }
                        },
                        {
                            key: "title3content",
                        },
                        {
                            key: "spaceafter",
                        }]
                    }],
            }]
        },
        {
        key: "footage",
        blocks: [{
            key: "footage1",
            validations: {
                duration: {
                    min: 3000,
                    max: 8000
                }
            }
        }]
        },
        {
            key: "Speak",
            blocks: [{
                key: "hello",
                validations: {
                    duration: {
                        max: 2000
                    },
                    outTime: {
                        fixed: 8000
                    }
                }
            }]
        },
    ]
};*/

export const sampleData3 = {
	duration: 20000,
	layers: [
		{
			key: 'signs',
			blocks: [
				{
					key: 'sign1',
					validations: {
						duration: {
							fixed: 3000
						},
						inTime: {
							fixed: 1000
						}
					}
				},
				{
					key: 'sign2',
					validations: {
						duration: {
							fixed: 4000
						},
						outTime: {
							fixed: 8000
						}
					}
				}
			]
		},
		{
			key: 'footage',
			blocks: [
				{
					key: 'footage1',
					validations: {
						duration: {
							min: 3000,
							max: 8000
						}
					}
				}
			]
		},
		{
			key: 'Speak',
			blocks: []
		}
	]
};
