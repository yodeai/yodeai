import React from "react";

import { FaBox } from "@react-icons/all-files/fa/FaBox";
import { FaBuffer } from "@react-icons/all-files/fa/FaBuffer";
import { FaBug } from "@react-icons/all-files/fa/FaBug";
import { FaChartArea } from "@react-icons/all-files/fa/FaChartArea";
import { FaCog } from "@react-icons/all-files/fa/FaCog";
import { FaCookie } from "@react-icons/all-files/fa/FaCookie";
import { FaExpand } from "@react-icons/all-files/fa/FaExpand";
import { FaFileExcel } from "@react-icons/all-files/fa/FaFileExcel";
import { FaFolder } from "@react-icons/all-files/fa/FaFolder";
import { FaStar } from "@react-icons/all-files/fa/FaStar";

import { FaCube } from "@react-icons/all-files/fa6/FaCube";
import { FaFileLines } from "@react-icons/all-files/fa6/FaFileLines";
import { FaFilePdf } from "@react-icons/all-files/fa6/FaFilePdf";
import { FaGoogleDrive } from "@react-icons/all-files/fa6/FaGoogleDrive";
import { FaChalkboard } from "@react-icons/all-files/fa6/FaChalkboard";
import { FaUsersGear } from "@react-icons/all-files/fa6/FaUsersGear";
import { FaMagnifyingGlassChart } from "@react-icons/all-files/fa6/FaMagnifyingGlassChart";
import { FaPuzzlePiece } from "@react-icons/all-files/fa6/FaPuzzlePiece";
import { FaChartLine } from "@react-icons/all-files/fa6/FaChartLine";


import { IconBaseProps } from "@react-icons/all-files/lib";


import { SharedSubspace } from "./custom/index";

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
    shared_subspace: (props) => <SharedSubspace {...defaultProps} {...props} />,

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