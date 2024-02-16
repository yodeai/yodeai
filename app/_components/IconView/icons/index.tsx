import React, { ReactNode } from "react";
import { FaBox, FaBuffer, FaBug, FaChartArea, FaCog, FaCookie, FaExpand, FaFileExcel, FaFolder, FaStar } from "react-icons/fa";
import {
    FaCube, FaFileLines, FaFilePdf, FaGoogleDrive,
    FaChalkboard, FaUsersGear, FaMagnifyingGlassChart, FaPuzzlePiece, FaChartLine
} from "react-icons/fa6";
import { IconBaseProps } from "react-icons/lib";
import { SharedSubspace } from "./custom";

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
    google_doc: (props) => <FaGoogleDrive {...defaultProps} color="#0f9d58" {...props} />,
    spreadsheet: (props) => <FaFileExcel {...defaultProps} {...props} />,

    // plugin icons
    "plugin_user-insight": (props) => <FaUsersGear {...defaultProps} {...props} />,
    "plugin_competitive-analysis": (props) => <FaMagnifyingGlassChart {...defaultProps} {...props} />,
    "plugin_default": (props) => <FaPuzzlePiece {...defaultProps} {...props} />,
    "plugin_pain-point-tracker": (props) => <FaChartLine {...defaultProps} {...props} />,

    // custom icons
    shared_subspace: (props) => <SharedSubspace transform="scale(0.75), translate(0, 10)"  {...props} />,

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