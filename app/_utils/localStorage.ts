

export function getLayoutViewFromLocalStorage(lens_id: string): "block" | "icon" {
    let layout = null;
    if (global.localStorage) {
        try {
            layout = JSON.parse(global.localStorage.getItem("layoutView")) || null;
        } catch (e) {
            /*Ignore*/
        }
    }
    return layout ? layout[lens_id] : null;
}

export function setLayoutViewToLocalStorage(lens_id: string, value: "block" | "icon") {
    if (global.localStorage) {
        const layout = JSON.parse(global.localStorage.getItem("layoutView") || "{}");
        global.localStorage.setItem(
            "layoutView",
            JSON.stringify({
                ...layout,
                [lens_id]: value
            })
        );
    }
}

export function getSortingOptionsFromLocalStorage() {
    let sortingOptions = null;
    if (global.localStorage) {
        try {
            sortingOptions = JSON.parse(global.localStorage.getItem("sortingOptions")) || null;
        } catch (e) {
            /*Ignore*/
        }
    }

    return sortingOptions;
}

export function setSortingOptionsToLocalStorage(sortingOptions: {
    order: "asc" | "desc",
    sortBy: null | "name" | "createdAt" | "updatedAt"
}) {
    if (global.localStorage) {
        global.localStorage.setItem("sortingOptions", JSON.stringify(sortingOptions));
    }
}

export function getActiveToolbarTab() {
    let activeTab = null;
    if (global.localStorage) {
        try {
            activeTab = JSON.parse(global.localStorage.getItem("activeToolbarTab")) || null;
        } catch (e) {
            /*Ignore*/
        }
    }

    return activeTab;
}

export function setActiveToolbarTab(activeTab: "questionform" | "social") {
    if (global.localStorage) {
        global.localStorage.setItem("activeToolbarTab", JSON.stringify(activeTab));
    }
}