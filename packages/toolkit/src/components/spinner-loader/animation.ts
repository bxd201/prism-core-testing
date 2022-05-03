export default {
  keyframes: [
    {
      transform: 'rotate(0deg)'
    },
    {
      transform: 'rotate(30deg)',
      offset: .083333
    },
    {
      transform: 'rotate(60deg)',
      offset: .166666
    },
    {
      transform: 'rotate(90deg)',
      offset: .25
    },
    {
      transform: 'rotate(120deg)',
      offset: .333333
    },
    {
      transform: 'rotate(150deg)',
      offset: .416666
    },
    {
      transform: 'rotate(180deg)',
      offset: .5
    },
    {
      transform: 'rotate(210deg)',
      offset: .583333
    },
    {
      transform: 'rotate(240deg)',
      offset: .666666
    },
    {
      transform: 'rotate(270deg)',
      offset: .75
    },
    {
      transform: 'rotate(300deg)',
      offset: .833333
    },
    {
      transform: 'rotate(330deg)',
      offset: .916666
    },
    {
      transform: 'rotate(360deg)',
    },
  ],
  properties: {
    duration: 1000,
    iterations: Infinity,
    easing: 'steps(10, jump-end)'
  }
}
