function generate(data) {
    let copies = [];
    let rounds = data.quantity;
    for (let i = 1; i <= rounds; i++) {
        let code = `${i}/${rounds}/${data.code}`;
        copies.push({
            bookId: data.bookId,
            libraryId: data.libraryId,
            code: code,
            dateOfAquisition: data.dateOfAquisition
        });
    }
    return copies;
}

module.exports = generate;