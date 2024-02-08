import React, { ReactNode } from "react";
import { FaBox, FaBuffer, FaBug, FaChartArea, FaCog, FaCookie, FaExpand, FaFolder, FaStar } from "react-icons/fa";
import {
    FaCube, FaFileLines, FaFilePdf, FaGoogleDrive,
    FaChalkboard, FaUsersGear, FaMagnifyingGlassChart, FaPuzzlePiece
} from "react-icons/fa6";
import { IconBaseProps } from "react-icons/lib";

const defaultProps = {
    color: "#888888",
    size: 32
}

const icons: {
    [key: string]: (props: IconBaseProps) => JSX.Element
} = {

    // built-in icons
    pdf: (props) => <FaFilePdf {...defaultProps} color="#228be6" {...props} />,
    note: (props) => <FaFileLines {...defaultProps} {...props} />,
    whiteboard: (props) => <FaChalkboard {...defaultProps} {...props} />,
    subspace: (props) => <FaCube {...defaultProps} {...props} />,
    google_doc: (props) => <FaGoogleDrive {...defaultProps} color="#0f9d58"  {...props} />,
    "plugin_user-insight": (props) => <FaUsersGear {...defaultProps} {...props} />,
    "plugin_competitive-analysis": (props) => <FaMagnifyingGlassChart {...defaultProps} {...props} />,
    "plugin_default": (props) => <FaPuzzlePiece {...defaultProps} {...props} />,

    // optional icons

    star: (props) => <FaStar {...defaultProps} {...props} />, 
    box: (props) => <FaBox {...defaultProps} {...props} />,
    cube: (props) => <FaCube {...defaultProps} {...props} />,
    bug: (props) => <FaBug {...defaultProps} {...props} />,
    chart: (props) => <FaChartArea {...defaultProps} {...props} />,
    buffer: (props) => <FaBuffer {...defaultProps} {...props} />,
    cog: (props) => <FaCog {...defaultProps} {...props} />,
    cookie: (props) => <FaCookie {...defaultProps} {...props} />,
    expand: (props) => <FaExpand {...defaultProps} {...props} />,
    folder: (props) => <FaFolder {...defaultProps} {...props} />,
}

export default icons;

//     pdf: ({ color, ...props }) => <FaFilePdf size={32} color="#228be6" {...props} />,
//     note: ({ color, ...props }) => <FaFileLines size={32} color="#888888" {...props} />,
//     whiteboard: ({ color, ...props }) => <FaChalkboard size={32} color="#888888" {...props} />,
//     subspace: ({ color, ...props }) => <FaCube size={32} {...props} />,
//     google_doc: ({ color, ...props }) => <FaGoogleDrive size={32} color="#0F9D58" {...props} />,
//     "plugin_user-insight": ({ color, ...props }) => <FaUsersGear size={32} color="#888888" {...props} />,
//     "plugin_competitive-analysis": ({ color, ...props }) => <FaMagnifyingGlassChart size={32} color="#888888" {...props} />,
//     "plugin_default": ({ color, ...props }) => <FaPuzzlePiece size={28} color="#888888" {...props} />
// }