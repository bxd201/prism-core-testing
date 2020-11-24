import React from "react";
import { shallow } from "enzyme";
import SceneDownload from "src/components/SceneDownload/SceneDownload";

describe("Scene Download Component", () => {
  const defaultProps = {
    buttonCaption: "DOWNLOAD_SCENE",
    colors: [
      {
        colorName: "6514",
        coordinatingColors: {
          coord2ColorId: "12328",
          coord1ColorId: "2962",
          whiteColorId: "2198"
        },
        description: ["Diluted", "Wan", "Bright", "Glowing"],
        id: "2201",
        isExterior: true,
        isInterior: true,
        name: "Respite",
        lrv: 43.055,
        brandedCollectionNames: ["Senior Living Color Collection"],
        colorFamilyNames: ["Purple"],
        brandKey: "SW",
        red: 151,
        green: 180,
        blue: 195,
        hue: 0.5568181818181818,
        saturation: 0.26829268292682923,
        lightness: 0.6784313725490196,
        hex: "#97b4c3",
        isDark: false,
        storeStripLocator: "184-C3",
        similarColors: [
          "11325",
          "2907",
          "11236",
          "2914",
          "2194",
          "1913",
          "2208",
          "11241",
          "1927",
          "1928"
        ],
        ignore: false,
        archived: false
      }
    ],
    scene: {
      status: {
        id: 1,
        variant: "day",
        surfaces: [
          {
            id: 1
          },
          {
            id: 2
          },
          {
            id: 3
          }
        ]
      },
      variant: {
        name: "Living Room Day",
        variant_name: "day",
        image:
          "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1311}&qlt=92",
        thumb:
          "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=300}&qlt=80",
        normalizedImageValueCurve:
          "0 0.1 0.15 0.25 0.4 0.5 0.6 0.7 0.84 0.955 1",
        expertColorPicks: [2761, 2043, 2689],
        associatedColorCollection: 31738,
        surfaces: [
          {
            id: 1,
            hitArea: "/prism/images/scenes/rooms/2/m1.svg",
            role: "main",
            colorId: 2761,
            mask: {
              _loadingPromise: Promise,
              _id: "msk4",
              blob: {
                size: 42748,
                type: "image/png"
              },
              _path:
                "blob:https://localhost:8080/b6df0e07-528f-452c-962f-0df6d2f69c73",
              _width: 1200,
              _height: 725,
              _load:
                "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1"
            }
          },
          {
            id: 2,
            hitArea: "/prism/images/scenes/rooms/2/m2.svg",
            role: "main",
            colorId: 2043,
            mask: {
              _loadingPromise: Promise,
              _id: "msk5",
              blob: {
                size: 26173,
                type: "image/png"
              },
              _path:
                "blob:https://localhost:8080/b8d65237-920c-49b1-9933-646b64fc14dc",
              _width: 1200,
              _height: 725,
              _load:
                "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1"
            }
          },
          {
            id: 3,
            hitArea: "/prism/images/scenes/rooms/2/m3.svg",
            role: "trim",
            colorId: 2689,
            mask: {
              _loadingPromise: Promise,
              _id: "msk6",
              blob: {
                size: 51694,
                type: "image/png"
              },
              _path:
                "blob:https://localhost:8080/4368a3db-c609-4801-bb2a-fb3bd63f335a",
              _width: 1200,
              _height: 725,
              _load:
                "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1"
            }
          }
        ]
      }
    }
  };
  it("renders with full props", () => {
    const props = { ...defaultProps };
    const wrapper = shallow(<SceneDownload {...props} />);
    expect(wrapper).toMatchInlineSnapshot(`
      <ul>
        <li
          style={
            Object {
              "display": "inline-block",
              "verticalAlign": "top",
            }
          }
        >
          <ul>
            <Button
              disabled={false}
              onClick={[Function]}
            >
              <FormattedMessage
                id="DOWNLOAD_SCENE"
                values={Object {}}
              />
            </Button>
          </ul>
        </li>
      </ul>
    `);
  });

  it("renders disabled is props property colors length is less than 1", () => {
    const props = { ...defaultProps };
    props.colors = [];
    const wrapper = shallow(<SceneDownload {...props} />);
    expect(wrapper).toMatchInlineSnapshot(`
      <ul>
        <li
          style={
            Object {
              "display": "inline-block",
              "verticalAlign": "top",
            }
          }
        >
          <ul>
            <Button
              disabled={true}
              onClick={[Function]}
            >
              <FormattedMessage
                id="DOWNLOAD_SCENE"
                values={Object {}}
              />
            </Button>
          </ul>
        </li>
      </ul>
    `);
    const button = wrapper.find("Button");
    expect(button.props().disabled).toEqual(true);
  });

  it("toggles to disabled when clicked", () => {
    const props = { ...defaultProps };
    const wrapper = shallow(<SceneDownload {...props} />);
    const button = wrapper.find("Button").at(0);
    expect(button.props().disabled).toEqual(false);
    button.props()['onClick']()
    wrapper.update()
    expect(
      wrapper
        .find("Button")
        .at(0)
        .props().disabled
    ).toEqual(true)
  });
});
