// src/utils/helpers.js
export const isModuleFullyChecked = (module, permissions) =>
    module.sub_modules.every(subModule =>
        subModule.permissions.every(permission => permissions.includes(permission.id))
    );

export const toggleAllSubModulePermissions = (module, permissions, isChecked) => {
    const updatedPermissions = [...permissions];
    module.sub_modules.forEach(subModule => {
        subModule.permissions.forEach(permission => {
            if (isChecked && !updatedPermissions.includes(permission.id)) {
                updatedPermissions.push(permission.id);
            } else if (!isChecked) {
                const index = updatedPermissions.indexOf(permission.id);
                if (index !== -1) {
                    updatedPermissions.splice(index, 1);
                }
            }
        });
    });
    return updatedPermissions;
};

export const toggleSubModulePermissions = (subModule, permissions, isChecked) => {
    const updatedPermissions = [...permissions];
    subModule.permissions.forEach(permission => {
        if (isChecked && !updatedPermissions.includes(permission.id)) {
            updatedPermissions.push(permission.id);
        } else if (!isChecked) {
            const index = updatedPermissions.indexOf(permission.id);
            if (index !== -1) {
                updatedPermissions.splice(index, 1);
            }
        }
    });
    return updatedPermissions;
};

export const resetFormData = () => ({
    id: '',
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    permissions: {
        inventoryManagement: {
            allowAll: false,
            expandAll: false,
            products: { add: false, view: false, update: false, delete: false },
        },
    },
});
