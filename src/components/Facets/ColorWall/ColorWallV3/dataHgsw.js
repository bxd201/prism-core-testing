const ids = new function All () {
  let all = new Array(9999).fill(null).map((v, i) => i)

  this.grab = (qty) => {
    const returner = all.slice(0, qty)
    all = all.slice(qty)
    return returner
  }
}()

const hgsw = {
  type: 'WALL',
  children: [
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
            height: 1,
            width: 1
          },
          children: [
            ids.grab(21),
            ids.grab(21),
            ids.grab(21)
          ]
        },
        {
          type: 'CHUNK',
          props: {
            spaceH: 0.5,
            spaceV: 0.5
          },
          childProps: {
            height: 1.08,
            width: 1.4
          },
          children: [
            ids.grab(15),
            ids.grab(15),
            ids.grab(15)
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
            ids.grab(21),
            ids.grab(21),
            ids.grab(21)
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
            height: 1,
            width: 1
          },
          children: [
            ids.grab(13),
            ids.grab(13),
            ids.grab(13)
          ]
        },
        {
          type: 'CHUNK',
          props: {
            spaceH: 0.5,
            spaceV: 0.5
          },
          childProps: {
            height: 1.08,
            width: 1.4
          },
          children: [
            ids.grab(10),
            ids.grab(10),
            ids.grab(10)
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
            ids.grab(13),
            ids.grab(13),
            ids.grab(13)
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
            height: 1,
            width: 1
          },
          children: [
            ids.grab(21),
            ids.grab(21),
            ids.grab(21)
          ]
        },
        {
          type: 'CHUNK',
          props: {
            spaceH: 0.5,
            spaceV: 0.5
          },
          childProps: {
            height: 1.08,
            width: 1.4
          },
          children: [
            ids.grab(15),
            ids.grab(15),
            ids.grab(15)
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
            ids.grab(21),
            ids.grab(21),
            ids.grab(21)
          ]
        }
      ]
    }
  ]
}

export default hgsw
