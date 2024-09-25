export class Segment {
    /*
    Variables:
    contact: list[int]
    path:    list[int]
    faceId:  int
    rank:    int
    */

    constructor(contact, path) {
        this.contact = contact;
        this.path = path;
        this.faceId = -1;
        this.rank = 0;
    }
}
