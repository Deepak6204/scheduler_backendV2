import { uuidv7 } from 'uuidv7';
import { parse, stringify } from 'uuid';

class UuidGen {
    static generateUuidV7Binary() {
        return uuidv7();
    }

    static uuidToBinary(uuidStr) {
        return Buffer.from(parse(uuidStr));
    }

    static binaryToUuid(binaryUuid) {
        return stringify(binaryUuid);
    }

}

export default UuidGen;
