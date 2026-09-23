const extractPathData = (data) => {
    if (!data) return null;

    let urlParts = data.page.filePathStem.split('/').filter(Boolean);

    if (urlParts[0].startsWith('_')) {
        return undefined;
    }
    
    const pathData = {
        collection: '',
        naked: undefined,
        // url: '',
    }
    // Remove 'index' if at the end
    if (urlParts[urlParts.length - 1] === 'index') {
        urlParts.pop();
        pathData.naked = ''
    }
    // Identify collection if at the start (remove from path if it is a common page)
    if (urlParts[0] === 'pages') {
        pathData.collection = 'pages';
        urlParts.shift();
    } else {
        for (const contentType of collections) {
            if (urlParts[0] === contentType) {
                pathData.collection = contentType;
                // TODO: later: replace path segment with chosen collection name
                // urlParts[0] = ...
                break;
            }
        }
    }
    // TODO: add parent naked path before child url

    pathData.naked = urlParts.join('/');
    // pathData.url = `/${pathData.naked}/`;

    return pathData;
}

const collections = ['articles']

export default {
    pathData: (data) => extractPathData(data),
    parentSlugs: (data) => {
        const items = data.collections.all;
        const parentSlug = data.parentSlug;
        let currentParentSlug = parentSlug;
        let parentSlugs = []
        while (currentParentSlug) {
            parentSlugs.unshift(currentParentSlug); // Add to the beginning of the array

            const currentParent = items.find(p => {
                return p.page.fileSlug === currentParentSlug
            });
            if (!currentParent) {
                // Parent not found, break the loop
                break;
            }
            currentParentSlug = currentParent?.data?.parentSlug;
        }

        return parentSlugs;
    },
    parents: (data) => {
        // Dependency declaration
        data.pathData;

        const items = data.collections.all;
        const parentSlug = data.parentSlug;
        let currentParentSlug = parentSlug;
        let parents = []
        while (currentParentSlug) {
            const currentParent = items.find(p => {
                return p.page.fileSlug === currentParentSlug
            });
            if (!currentParent) {
                // Parent not found, break the loop
                break;
            }
            parents.unshift(currentParent); // Add to the beginning of the array
            currentParentSlug = currentParent?.data?.parentSlug;
        }

        return parents;
    },
    urlComputed: (data) => {
        // Dependency declaration
        data.parents;
        data.pathData;

        const nakedParentsUrl = Array.isArray(data.parents) ? data.parents?.map(p => p?.data?.pathData?.naked).join('/') : ''
        const nakedUrl = `${nakedParentsUrl ? `${nakedParentsUrl}/` : ''}${data?.pathData?.naked || ''}`
        // console.log({ nakedUrl })
        return nakedUrl ?? `/${nakedUrl}/`;
    },
    tags: (data) => {
        const pathData = data.pathData;

        return [
            ...(pathData.collection ? [pathData.collection] : []),
            ...(data.tags || [])
        ].filter(Boolean);
    },
    eleventyNavigation: (data) => {
        const isNavItem = data.nav?.discriminant;
        const hasCustomNavValue = data.nav?.value?.discriminant;
        const navCustomValues = data.nav?.value?.value;
        if (!isNavItem) {
            // Do not add to eleventyNavigation
            return;
        }
        if (!hasCustomNavValue) {
            // Add to eleventyNavigation with default values from page
            return {
                key: data.page.fileSlug,
                title: data.name,
                // parent: data.parentSlug, // Not used for now... ?permalink bug?
                order: data.order ?? 0,
            }
        }
        if (hasCustomNavValue) {
            // Add to eleventyNavigation with customized nav values
            return {
                key: data.page.fileSlug,
                title: navCustomValues?.title ?? data.name,
                parent: navCustomValues?.parent ?? data.parentSlug,
                order: navCustomValues?.order ?? data.order ?? 0,
            }
        }
        console.error(`Unexpected nav configuration: ${data.nav}`)
        return;
    },
}