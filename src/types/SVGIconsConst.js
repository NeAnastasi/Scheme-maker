export const SVGIcon = {
  Table: ({ width = 100, height = 50, color = "black" }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="100"
        height="50"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  ),
  PC: ({ width = 100, height = 70, color = "black" }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 45 290 200"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25,45 c-2.761,0-5,2.239-5,5v140c0,2.761,2.239,5,5,5h240c2.761,0,5-2.239,5-5V50c0-2.761-2.239-5-5-5H25z M30,55h230v130H30V55z M45,65 c-2.761,0-5,2.239-5,5v100c0,2.761,2.239,5,5,5h200c2.761,0,5-2.239,5-5V70c0-2.761-2.239-5-5-5H45z M50,75h190v90H50V75z M5,205 c-2.761,0-5,2.239-5,5v30c0,2.761,2.239,5,5,5h280c2.761,0,5-2.239,5-5v-30c0-2.761-2.239-5-5-5H5z M10,215h80v5 c0,2.761,2.239,5,5,5h100c2.761,0,5-2.239,5-5v-5h80v20H10V215z"
        fill="black"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  ),
  Screen: ({ width = 100, height = 12, color = "black" }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 10"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="80"
        height="10"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  ),
  Speaker: ({ width = 50, height = 80, color = "black" }) => (
    <svg
      width={width}
      height={height}
      viewBox="64 26 128 206"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={color}
        stroke={color}
        strokeWidth="1"
        d="M192 41.993v174.014c0 8.827-7.164 15.993-16 15.993H80c-8.844 0-16-7.16-16-15.993V41.993C64 33.166 71.164 26 80 26h96c8.844 0 16 7.16 16 15.993zm-16 9.015c0-4.423-3.588-8.008-8-8.008H88c-4.419 0-8 3.573-8 8.008v155.984c0 4.423 3.588 8.008 8 8.008h80c4.419 0 8-3.573 8-8.008V51.008z"
      ></path>
      <path
        fill={color}
        stroke={color}
        strokeWidth="1"
        d="M128 192c-17.673 0-32-14.327-32-32 0-17.673 14.327-32 32-32 17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32zm.5-16c8.56 0 15.5-7.163 15.5-16s-6.94-16-15.5-16c-8.56 0-15.5 7.163-15.5 16s6.94 16 15.5 16zm-.5-72c-12.703 0-23-10.521-23-23.5S115.297 57 128 57s23 10.521 23 23.5-10.297 23.5-23 23.5zm0-14.769c4.694 0 8.953-.25 8.953-9.087s-4.225-9.48-8.92-9.48c-4.694 0-8.919.643-8.919 9.48s4.192 9.087 8.886 9.087z"
      ></path>
    </svg>
  ),
};

export const SVGIconType = {
  Table: "Table",
  PC: "PC",
  Screen: "Screen",
  Speaker: "Speaker",
  Monitor: "Monitor",
};
