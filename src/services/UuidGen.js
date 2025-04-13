import { uuidv7 } from 'uuidv7';
import { parse, stringify } from 'uuid';

export const generateUuidV7Binary = () => {
    return uuidv7();
};

export const uuidToBinary = (uuidStr) => {
    return Buffer.from(parse(uuidStr));
};

export const binaryToUuid = (binaryUuid) => {
    return stringify(binaryUuid);
};
