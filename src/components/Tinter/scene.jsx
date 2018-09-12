import React, { PureComponent } from 'react';

class RoomScene extends PureComponent {
  constructor( props ) {
		super( props );
		
		this.onClickMethod = this.props.onClickMethod.bind(this);
		this.modifierClass = this.props.isLower ? "scene__room-wrapper--bottom" : "";
  }

  render() {
    return (
			<div className={"scene__room-wrapper " + this.modifierClass} key={this.props.keyIndex}>
				<div className="scene__room__tinted-wrapper" style={{backgroundColor: this.props.tintColor}}>
					<img className="scene__room scene__room--tinted" src="/src/images/room.jpg" alt="" />
				</div>
				<img className="scene__room scene__room--natural" src="/src/images/room.jpg" alt="" />
				<div className="scene__room__tinted-wrapper scene__room__tinted-wrapper--rear-wall" style={{backgroundColor: this.props.secondaryTintColor}}>
					<img className="scene__room scene__room--tinted scene__room--rear-wall" src="/src/images/room.jpg" alt="" />
				</div>
				<div className="scene__room__tinted-wrapper scene__room__tinted-wrapper--fixtures" style={{backgroundColor: this.props.secondaryTintColor}}>
					<img className="scene__room scene__room--hue-rotated" src="/src/images/room.jpg" alt="" style={{filter: `hue-rotate(${this.props.fixtureHueRotation}deg)`}}/>
				</div>
				<div onClick={this.onClickMethod} className="scene__color-info-wrapper">
					<button className="scene__color-info scene__color-info--main">
						<p className="scene__color-info-copy-wrapper" style={{background: this.props.primaryGradient}}>
							<span className="scene__color-info-copy scene__color-info--number" style={{color: this.props.displayColor}}>SW {this.props.colorNumber}</span>
							<span className="scene__color-info-copy scene__color-info--name" style={{color: this.props.displayColor}}>{this.props.colorName}</span>
						</p>
					</button>
					<button className="scene__color-info scene__color-info--coord1">
						<p className="scene__color-info-copy-wrapper" style={{background: this.props.CoordColorOneGradient}}>
							<span className="scene__color-info-copy scene__color-info--number" style={{color: this.props.CoordColorOneDisplayColor}}>SW {this.props.CoordColorOneNumber}</span>
							<span className="scene__color-info-copy scene__color-info--name" style={{color: this.props.CoordColorOneDisplayColor}}>{this.props.CoordColorOneName}</span>
						</p>
					</button>
					<button className="scene__color-info scene__color-info--coord2">
						<p className="scene__color-info-copy-wrapper" style={{background: this.props.CoordColorTwoGradient}}>
							<span className="scene__color-info-copy scene__color-info--number" style={{color: this.props.CoordColorTwoDisplayColor}}>SW {this.props.CoordColorTwoNumber}</span>
							<span className="scene__color-info-copy scene__color-info--name" style={{color: this.props.CoordColorTwoDisplayColor}}>{this.props.CoordColorTwoName}</span>
						</p>
					</button>
				</div>
				<div className="center-content center-content--color-info-cta">
					<button className="scene__color-info-cta" onClick={this.onClickMethod}>
						<svg className="scene__color-info-cta-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
							<path style={{fill: this.props.secondaryTintColor}} d="M255.75,186c87.45,0,171.72,51.82,230.33,111.51C440.91,374.4,351.36,426,255.75,426 S70.59,374.4,25.42,297.51C84.03,237.82,168.3,186,255.75,186z"/>
							<path style={{fill: this.props.tintColor}} d="M325.75,306c0-38.66-31.34-70-70-70c-39.637,0-70,32.647-70,70c0,38.66,31.34,70,70,70 C294.413,376,325.75,344.658,325.75,306z"/>
							<path style={{fill: this.props.tintColor}} d="M255.75,286c11.05,0,20,8.95,20,20s-8.95,20-20,20c-11.05,0-20-8.95-20-20S244.7,286,255.75,286z"/>
							<path d="M203.07,273.07c3.91-3.9,3.91-10.24,0-14.14c-3.9-3.91-10.24-3.91-14.14,0c-3.91,3.9-3.91,10.24,0,14.14 C192.83,276.98,199.17,276.98,203.07,273.07z"/>
							<path d="M286,306c0-16.542-13.458-30-30-30s-30,13.458-30,30s13.458,30,30,30S286,322.542,286,306z M246,306c0-5.514,4.486-10,10-10 s10,4.486,10,10s-4.486,10-10,10S246,311.514,246,306z"/>
							<path d="M256,386c44.112,0,80-35.888,80-80s-35.888-80-80-80c-11.178,0-21.987,2.259-32.124,6.715 c-5.056,2.223-7.353,8.123-5.131,13.179s8.123,7.352,13.179,5.131C239.509,247.691,247.61,246,256,246c33.084,0,60,26.916,60,60 s-26.916,60-60,60s-60-26.916-60-60c0-0.342-0.001-0.676,0.007-1.018c0.128-5.521-4.244-10.101-9.765-10.229 c-5.53-0.138-10.101,4.243-10.229,9.765C176.001,305.016,176,305.502,176,306C176,350.112,211.888,386,256,386z"/>
							<path d="M266,146V86c0-5.523-4.477-10-10-10s-10,4.477-10,10v60c0,5.523,4.477,10,10,10C261.523,156,266,151.523,266,146z"/>
							<path d="M144.281,164.281c3.905-3.905,3.905-10.237,0-14.143l-42.42-42.42c-3.905-3.905-10.237-3.905-14.143,0 c-3.905,3.905-3.905,10.237,0,14.143l42.42,42.42C134.043,168.186,140.376,168.187,144.281,164.281z"/>
							<path d="M381.862,164.281l42.42-42.42c3.905-3.905,3.905-10.237,0-14.143c-3.905-3.905-10.237-3.905-14.143,0l-42.42,42.42 c-3.905,3.905-3.905,10.237,0,14.143C371.623,168.186,377.956,168.187,381.862,164.281z"/>
							<path d="M2.505,307.71c-3.656,4.14-3.264,10.459,0.875,14.115c4.14,3.656,10.46,3.264,14.115-0.875 c2.131-2.413,4.314-4.817,6.525-7.206C73.435,388.408,163.013,436,256,436s182.565-47.592,231.98-122.256 c2.211,2.39,4.394,4.794,6.525,7.206c3.644,4.126,9.963,4.542,14.115,0.875c4.139-3.656,4.531-9.976,0.875-14.115 C445.97,235.791,351.646,176,256,176C160.341,176,66.018,235.806,2.505,307.71z M256,196c99.74,0,182.061,68.109,217.689,103.019 C428.471,370.321,343.915,416,256,416S83.529,370.321,38.311,299.02C73.939,264.109,156.261,196,256,196z"/>
						</svg>
						<span className="scene__color-info-cta-copy">{this.props.colorInfoCTAcopy}</span>
					</button>
				</div>
				<div className="center-content center-content--favorite-cta">
					<button className="scene__favorite-cta" onClick={this.onFavoriteMethod}>
						<svg style={{fill: this.props.tintColor}} className="icon scene__favorite-cta-icon scene__favorite-cta-icon--add" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 19.788 19.788">
							<path d="M14.503,8.252c0.902,0,1.757,0.203,2.522,0.563c0.554-0.928,0.952-1.827,1.084-2.63 c0.274-1.675,0.032-3.026-0.72-4.014c-0.76-0.997-1.965-1.57-3.687-1.755c-0.137-0.014-0.283-0.022-0.431-0.022 c-1.489,0-3.178,0.721-4.162,2.086c-0.985-1.365-2.672-2.086-4.16-2.086c-0.149,0-0.294,0.008-0.432,0.022 C2.795,0.602,1.591,1.175,0.831,2.17C0.078,3.158-0.165,4.509,0.108,6.185c0.667,4.073,8.205,10.607,8.526,10.884 c0.146,0.125,0.327,0.188,0.508,0.188c0.085,0,0.17-0.015,0.251-0.044c-0.525-0.886-0.829-1.92-0.829-3.023 C8.564,10.916,11.229,8.252,14.503,8.252z M17.035,6.816c0,0-0.292-4.371-4.177-4.954C12.858,1.862,17.521,1.182,17.035,6.816z M14.503,8.827c-2.916,0-5.283,2.365-5.283,5.283s2.367,5.284,5.283,5.284c2.92,0,5.285-2.366,5.285-5.284 C19.788,11.191,17.423,8.827,14.503,8.827z M14.503,18.575c-2.465,0-4.464-2-4.464-4.465c0-2.467,1.999-4.465,4.464-4.465 c2.467,0,4.466,1.998,4.466,4.465C18.969,16.575,16.97,18.575,14.503,18.575z M17.694,13.115v1.926h-2.213v2.26h-1.925v-2.26 h-2.243v-1.926h2.243v-2.197h1.925v2.197C15.481,13.115,17.694,13.115,17.694,13.115z"/>
						</svg>
						<svg style={{fill: this.props.tintColor}} className="icon scene__favorite-cta-icon scene__favorite-cta-icon--subtract" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 19.788 19.788">
							<path d="M 14.503 8.252 C 15.405 8.252 16.26 8.455 17.025 8.815 C 17.579 7.887 17.977 6.988 18.109 6.185 C 18.383 4.51 18.141 3.159 17.389 2.171 C 16.629 1.174 15.424 0.601 13.702 0.416 C 13.565 0.402 13.419 0.394 13.271 0.394 C 11.782 0.394 10.093 1.115 9.109 2.48 C 8.124 1.115 6.437 0.394 4.949 0.394 C 4.8 0.394 4.655 0.402 4.517 0.416 C 2.795 0.602 1.591 1.175 0.831 2.17 C 0.078 3.158 -0.165 4.509 0.108 6.185 C 0.775 10.258 8.313 16.792 8.634 17.069 C 8.78 17.194 8.961 17.257 9.142 17.257 C 9.227 17.257 9.312 17.242 9.393 17.213 C 8.868 16.327 8.564 15.293 8.564 14.19 C 8.564 10.916 11.229 8.252 14.503 8.252 Z M 17.035 6.816 C 17.035 6.816 16.743 2.445 12.858 1.862 C 12.858 1.862 17.521 1.182 17.035 6.816 Z M 14.503 8.827 C 11.587 8.827 9.22 11.192 9.22 14.11 C 9.22 17.028 11.587 19.394 14.503 19.394 C 17.423 19.394 19.788 17.028 19.788 14.11 C 19.788 11.191 17.423 8.827 14.503 8.827 Z M 14.503 18.575 C 12.038 18.575 10.039 16.575 10.039 14.11 C 10.039 11.643 12.038 9.645 14.503 9.645 C 16.97 9.645 18.969 11.643 18.969 14.11 C 18.969 16.575 16.97 18.575 14.503 18.575 Z M 17.694 13.115 L 17.694 15.041 L 15.481 15.041 L 13.556 15.041 L 11.313 15.041 L 11.313 13.115 L 13.556 13.115 L 15.481 13.115 L 17.694 13.115 Z"/>
						</svg>
						<span className="scene__favorite-cta-copy">{this.props.favoriteCTAcopy}</span>
					</button>
				</div>
			</div>
    )
  }
}

export default RoomScene;