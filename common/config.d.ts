// types for common settings and configurations that are used to configure multiple packages

export type PerstistentVolume = {
    name: string;
    size: string;
    storageClass: string;
    accessMode: string;
    mountPath: string;
};

