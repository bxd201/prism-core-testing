const ids = new function All () {
  let all = new Array(9999).fill(null).map((v, i) => i)

  this.grab = (qty) => {
    const returner = all.slice(0, qty)
    all = all.slice(qty)
    return returner
  }
}()

const valspar = {
  type: 'WALL',
  children: [
    {
      type: 'COLUMN',
      children: [
        {
          type: 'ROW',
          children: [
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            }
          ]
        },
        {
          type: 'ROW',
          children: [
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            }
          ]
        },
        {
          type: 'ROW',
          children: [
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            }
          ]
        },
        {
          type: 'ROW',
          children: [
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            },
            {
              type: 'CHUNK',
              props: {
                spaceH: 0.5,
                spaceV: 0.5
              },
              childProps: {
                height: 1,
                width: 1
              },
              children: [
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12),
                ids.grab(12)
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'COLUMN',
      children: [
        {
          type: 'CHUNK',
          props: {
            spaceH: 0.5,
            spaceV: 0.5
          },
          childProps: {
            height: 1.22,
            width: 1.22
          },
          children: [
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12)
          ]
        },
        {
          type: 'CHUNK',
          props: {
            spaceH: 0.5,
            spaceV: 0.5
          },
          childProps: {
            height: 1.22,
            width: 1.22
          },
          children: [
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12)
          ]
        },
        {
          type: 'CHUNK',
          props: {
            spaceH: 0.5,
            spaceV: 0.5
          },
          childProps: {
            height: 1.22,
            width: 1.22
          },
          children: [
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12),
            ids.grab(12)
          ]
        }
      ]
    }
  ]
}

export default valspar
