import { Block, ColumnShape, WallShape } from '../../components/color-wall/types'

export const mockWallShape: WallShape = {
  type: Block.Wall,
  props: {
    wrap: true
  },
  children: [
    {
      type: Block.Column,
      props: {
        align: 'start'
      },
      children: [
        {
          type: Block.Row,
          children: [],
          props: {
            spaceH: 0.25
          },
          titles: [
            {
              value: 'Top Colors',
              align: 'left',
              level: 2
            }
          ]
        },
        {
          type: Block.Row,
          children: [
            {
              type: Block.Column,
              children: [
                {
                  type: Block.Row,
                  children: [
                    {
                      type: Block.Chunk,
                      children: [
                        [11346, 1939, 2967, 2959, 2823, 1758, 11345, 2847],
                        [1688, 2968, 2745, 2960, 2710, 2957, 2752, 2738],
                        [2731, 2696, 2963, 2703, 2717, 2724, 1940, 2817],
                        [2955, 2746, 2969, 11353, 1689, 2830, 1759, 2818],
                        [2812, 2697, 2944, 2711, 2964, 2725, 2732, 2753],
                        [2739, 2718, 2704, 2958, 1941, 1760, 1690, 2956],
                        [2965, 2698, 2747, 2740, 2754, 2705, 2813, 2712],
                        [2719, 2939, 2946, 2726, 2961, 11341, 11347, 2966],
                        [11350, 11342, 2970, 2819, 11349, 11343, 2810, 11344],
                        [11354, 11348, 11351, 2814, 2699, 1942, 2755, 1761],
                        [2748, 2706, 2720, 2713, 2741, 2727, 2820, 2700],
                        [2971, 2930, 2928, 1943, 2910, 2756, 2707, 2749],
                        [2728, 2721, 2980, 2729, 2921, 2701, 2757, 11360],
                        [2708, 2750, 1930, 11358, 11359, 2680, 1693, 11362],
                        [2679, 2678, 2677, 2676, 1944]
                      ],
                      props: {
                        spaceH: 0.25,
                        spaceV: 0.25,
                        align: 'start'
                      },
                      titles: [
                        {
                          align: 'left',
                          level: 1,
                          value: 'Neutral'
                        }
                      ],
                      childProps: {}
                    }
                  ],
                  props: {
                    align: 'start',
                    wrap: true
                  },
                  titles: []
                }
              ],
              props: {
                align: 'start'
              },
              titles: []
            },
            {
              type: Block.Column,
              children: [
                {
                  type: Block.Row,
                  children: [
                    {
                      type: Block.Chunk,
                      children: [
                        [11056, 2769, 2765, 2767, 2687, 2868, 2768, 2681],
                        [2872, 2770, 2686, 2771, 2685, 2688, 2857, 11364],
                        [2682, 2689, 2683, 2071, 2863, 2864, 2693, 2766],
                        [2064, 2862, 2050, 1938, 2191, 2694, 1890, 2684],
                        [2690, 2942, 2932, 1918, 1834, 2933, 2962, 2860],
                        [1757, 1841, 2057, 1925, 2877, 2744, 1736, 1687],
                        [2751, 2695, 2709, 1855, 2737, 2723, 1945, 1827],
                        [2730, 2691, 1799, 2716, 1785, 11363, 2972, 1792],
                        [1883, 1820, 2692, 2943, 2702, 2937, 1813, 1806],
                        [2952, 2876, 2934, 2874, 2822, 2953, 2861, 2843],
                        [2837, 2954, 2977, 2940]
                      ],
                      props: {
                        spaceH: 0.25,
                        spaceV: 0.25,
                        align: 'start'
                      },
                      titles: [
                        {
                          align: 'left',
                          level: 1,
                          value: 'White & Pastel'
                        }
                      ],
                      childProps: {}
                    }
                  ],
                  props: {
                    align: 'start',
                    wrap: true
                  },
                  titles: []
                },
                {
                  type: Block.Row,
                  children: [
                    {
                      type: Block.Chunk,
                      children: [[1995, 2270, 1744, 1772, 11261, 2555, 2007, 1756]],
                      props: {
                        spaceH: 0.25,
                        spaceV: 0.25,
                        align: 'start'
                      },
                      titles: [
                        {
                          align: 'left',
                          level: 1,
                          value: 'Red'
                        }
                      ],
                      childProps: {}
                    }
                  ],
                  props: {
                    align: 'start',
                    wrap: true
                  },
                  titles: []
                },
                {
                  type: Block.Row,
                  children: [
                    {
                      type: Block.Chunk,
                      children: [[2507, 2241, 2508, 1946, 1962]],
                      props: {
                        spaceH: 0.25,
                        spaceV: 0.25,
                        align: 'start'
                      },
                      titles: [
                        {
                          align: 'left',
                          level: 1,
                          value: 'Purple'
                        }
                      ],
                      childProps: {}
                    }
                  ],
                  props: {
                    align: 'start',
                    wrap: true
                  },
                  titles: []
                }
              ],
              props: {
                align: 'start'
              },
              titles: []
            },
            {
              type: Block.Column,
              children: [
                {
                  type: Block.Row,
                  children: [
                    {
                      type: Block.Chunk,
                      children: [
                        [11324, 1919, 1932, 1905, 1926, 1933, 1920, 1906],
                        [1934, 11318, 1921, 11332, 11323, 1935, 1922, 2171],
                        [1936, 11321, 1923, 1937, 2908, 11330]
                      ],
                      props: {
                        spaceH: 0.25,
                        spaceV: 0.25,
                        align: 'start'
                      },
                      titles: [
                        {
                          align: 'left',
                          level: 1,
                          value: 'Blue'
                        }
                      ],
                      childProps: {}
                    }
                  ],
                  props: {
                    align: 'start',
                    wrap: true
                  },
                  titles: []
                },
                {
                  type: Block.Row,
                  children: [
                    {
                      type: Block.Chunk,
                      children: [
                        [1891, 1898, 1884, 1892, 1885, 1893, 1851, 1865],
                        [1886, 11310, 1894, 2154]
                      ],
                      props: {
                        spaceH: 0.25,
                        spaceV: 0.25,
                        align: 'start'
                      },
                      titles: [
                        {
                          align: 'left',
                          level: 1,
                          value: 'Green'
                        }
                      ],
                      childProps: {}
                    }
                  ],
                  props: {
                    align: 'start',
                    wrap: true
                  },
                  titles: []
                },
                {
                  type: Block.Row,
                  children: [
                    {
                      type: Block.Chunk,
                      children: [
                        [2072, 11289, 1842, 1835, 1814, 1856, 1828, 1807],
                        [11290, 1836, 1829, 11291, 1830, 1837]
                      ],
                      props: {
                        spaceH: 0.25,
                        spaceV: 0.25,
                        align: 'start'
                      },
                      titles: [
                        {
                          align: 'left',
                          level: 1,
                          value: 'Yellow'
                        }
                      ],
                      childProps: {}
                    }
                  ],
                  props: {
                    align: 'start',
                    wrap: true
                  },
                  titles: []
                },
                {
                  type: Block.Row,
                  children: [
                    {
                      type: Block.Chunk,
                      children: [
                        [2065, 1765, 11265, 1786, 1793, 2066, 2059, 1766],
                        [1787, 1794, 1767, 1788, 1795, 2307, 1789, 2904],
                        [1770]
                      ],
                      props: {
                        spaceH: 0.25,
                        spaceV: 0.25,
                        align: 'start'
                      },
                      titles: [
                        {
                          align: 'left',
                          level: 1,
                          value: 'Orange'
                        }
                      ],
                      childProps: {}
                    }
                  ],
                  props: {
                    align: 'start',
                    wrap: true
                  },
                  titles: []
                }
              ],
              props: {
                align: 'start'
              },
              titles: []
            }
          ],
          props: {
            align: 'start',
            wrap: true
          },
          titles: []
        }
      ]
    },
    {
      type: Block.Column,
      props: {
        align: 'start'
      },
      children: [
        {
          type: Block.Row,
          children: [],
          props: {
            spaceH: 0.25
          },
          titles: [
            {
              value: 'Emerald Designer Edition Colors',
              align: 'left',
              level: 2
            }
          ]
        },
        {
          type: Block.Row,
          children: [
            {
              type: Block.Chunk,
              children: [
                [30040, 30002, 30081, 30041, 30043, 30121, 30042, 30123],
                [30080, 30120, 30055, 30082, 30130, 30044, 30181, 30045],
                [30140, 30085, 30135, 30070, 30088, 30131, 30089, 30060],
                [30048, 30049, 30006, 30150, 30100, 30047, 30056, 30046],
                [30076, 30086, 30061, 30141, 30116, 30132, 30182, 30146],
                [30157, 30071, 30142, 30057, 30133, 30063, 30149, 30183],
                [30064, 30184]
              ],
              props: {
                spaceH: 0.25,
                spaceV: 0.25,
                align: 'start'
              },
              titles: [
                {
                  align: 'left',
                  level: 1,
                  value: '   ',
                  hideWhenWrapped: true
                }
              ],
              childProps: {}
            }
          ],
          props: {
            align: 'start',
            wrap: true
          },
          titles: []
        }
      ]
    }
  ]
}

export const mockColWithChunksShape: WallShape = {
  type: Block.Wall,
  props: {
    wrap: true
  },
  children: [
    {
      type: Block.Column,
      props: {
        align: 'start'
      },
      titles: [
        {
          value: 'Top Colors',
          align: 'left',
          level: 2
        }
      ],
      children: [
        {
          type: Block.Row,
          children: [
            {
              type: Block.Chunk,
              children: [
                [11056, 2769, 2765, 2767, 2687, 2868, 2768, 2681],
                [2872, 2770, 2686, 2771, 2685, 2688, 2857, 11364],
                [2682, 2689, 2683, 2071, 2863, 2864, 2693, 2766],
                [2064, 2862, 2050, 1938, 2191, 2694, 1890, 2684],
                [2690, 2942, 2932, 1918, 1834, 2933, 2962, 2860],
                [1757, 1841, 2057, 1925, 2877, 2744, 1736, 1687],
                [2751, 2695, 2709, 1855, 2737, 2723, 1945, 1827],
                [2730, 2691, 1799, 2716, 1785, 11363, 2972, 1792],
                [1883, 1820, 2692, 2943, 2702, 2937, 1813, 1806],
                [2952, 2876, 2934, 2874, 2822, 2953, 2861, 2843],
                [2837, 2954, 2977, 2940]
              ],
              props: {
                spaceH: 0.25,
                spaceV: 0.25,
                align: 'start'
              },
              titles: [
                {
                  align: 'left',
                  level: 1,
                  value: 'White & Pastel'
                }
              ],
              childProps: {}
            }
          ],
          props: {
            align: 'start',
            wrap: true
          },
          titles: []
        },
        {
          type: Block.Chunk,
          children: [
            [11056, 2769, 2765, 2767, 2687, 2868, 2768, 2681],
            [2872, 2770, 2686, 2771, 2685, 2688, 2857, 11364],
            [2682, 2689, 2683, 2071, 2863, 2864, 2693, 2766],
            [2064, 2862, 2050, 1938, 2191, 2694, 1890, 2684],
            [2690, 2942, 2932, 1918, 1834, 2933, 2962, 2860],
            [1757, 1841, 2057, 1925, 2877, 2744, 1736, 1687],
            [2751, 2695, 2709, 1855, 2737, 2723, 1945, 1827],
            [2730, 2691, 1799, 2716, 1785, 11363, 2972, 1792],
            [1883, 1820, 2692, 2943, 2702, 2937, 1813, 1806],
            [2952, 2876, 2934, 2874, 2822, 2953, 2861, 2843],
            [2837, 2954, 2977, 2940]
          ],
          props: {
            spaceH: 0.25,
            spaceV: 0.25,
            align: 'start'
          },
          titles: [
            {
              align: 'left',
              level: 1,
              value: 'White & Pastel'
            }
          ]
        }
      ]
    }
  ]
}

export const mockColWithNoChildShape: ColumnShape = {
  type: Block.Column,
  props: {
    align: 'start'
  },
  titles: [],
  children: []
}
