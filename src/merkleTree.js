const { sha3, bufferToHex, bufferToInt, setLengthLeft } = require("ethereumjs-util")

// Based on:
// https://github.com/ameensol/merkle-tree-solidity/blob/master/js/merkle.js
// https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/test/helpers/merkleTree.js

module.exports = class MerkleTree {
    constructor (elements) {
        // Hash elements
        this.elements = elements.map(el => sha3(el))
        // Create layers
        this.layers = this.getLayers(this.elements)
    }

    getLayers (elements) {
        if (elements.length === 0) {
        }

        const layers = []
        layers.push(elements)

        // Get next layer until we reach the root
        while (layers[layers.length - 1].length > 1) {
            layers.push(this.getNextLayer(layers[layers.length - 1]))
        }

        return layers
    }

    getNextLayer (elements) {
        return elements.reduce((layer, el, idx, arr) => {
            if (idx % 2 === 0) {
                // Hash the current element with its pair element
                layer.push(this.combinedHash(el, arr[idx + 1]))
            }

            return layer
        }, [])
    }

    combinedHash (first, second) {
        if (!first) { return second }
        if (!second) { return first }

        return sha3(this.sortAndConcat(first, second))
    }

    getRoot () {
        return this.layers[this.layers.length - 1][0]
    }

    getHexRoot () {
        return bufferToHex(this.getRoot())
    }

    getProof (el) {
        let idx = this.bufIndexOf(el, this.elements)

        if (idx === -1) {
            throw new Error('Element does not exist in Merkle tree')
        }

        return this.layers.reduce((proof, layer) => {
            const pairElement = this.getPairElement(idx, layer)

            if (pairElement) {
                proof.push(pairElement)
            }

            idx = Math.floor(idx / 2)

            return proof
        }, [])
    }

    getHexProof (el) {
        const proof = this.getProof(el)
        return this.bufArrToHex(proof)
    }

    getHexBatchProofs (els) {
        return '0x' + els.map(el => {
            // Strip 0x
            const hexProof = this.getHexProof(el).slice(2)
            return setLengthLeft(hexProof.length / 2, 32).toString('hex') + hexProof
        }).join('')
    }

    getPairElement (idx, layer) {
        const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1

        if (pairIdx < layer.length) {
            return layer[pairIdx]
        } else {
            return null
        }
    }

    bufIndexOf (el, arr) {
        let hash

        // Convert element to 32 byte hash if it is not one already
        if (el.length !== 32 || !Buffer.isBuffer(el)) {
            hash = sha3(el)
        } else {
            hash = el
        }

        for (let i = 0; i < arr.length; i++) {
            if (hash.equals(arr[i])) {
                return i
            }
        }

        return -1
    }

    bufArrToHex (arr) {
        if (arr.some(el => !Buffer.isBuffer(el))) {
            throw new Error('Array is not an array of buffers')
        }
        const rsp = [];
        arr.forEach((el) => {
            rsp.push(`0x${el.toString('hex')}`);
        })
        return rsp;
    }

    sortAndConcat (...args) {
        return Buffer.concat([...args].sort(Buffer.compare))
    }

    getNumLeaves () {
        if (this.layers.length == 0) {
            throw new Error('Merkle tree does not have any leaves')
        }

        return this.layers[0].length
    }

    extractProofsFromBatch (hexBatchProofs) {
        const data = Buffer.from(hexBatchProofs.slice(2), "hex")

        let proofs = []
        let i = 0

        while (i < data.length) {
            const proofSize = bufferToInt(data.slice(i, i + 32))

            proofs.push(data.slice(i + 32, i + 32 + proofSize))

            i += (proofSize + 32)
        }

        return proofs
    }

    verifyProof (el, proof) {
        let leaf

        if (el.length !== 32 || !Buffer.isBuffer(el)) {
            leaf = sha3(el)
        } else {
            leaf = el
        }

        return this.getRoot().equals(proof.reduce((hash, pair) => {
            return this.combinedHash(hash, pair)
        }, leaf))
    }
}
