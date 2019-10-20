const config = require('../../config')
const { QuadTree, Box } = require('js-quadtree')

const BOUNDING_BOX = new Box(0, 0, config.world['plane-width'], config.world['plane-height'])

const TREE_CONFIG = {
    capacity: 16,
    removeEmptyNodes: true
}

// TODO allow specific bounds, default to world bounds

class Instance {
    constructor(server, name, disposeWhenEmpty) {
        this.server = server
        this.name = name
        this.disposeWhenEmpty = disposeWhenEmpty

        this.players = new Set() // remove in future
        this.playersRequiringMovement = new Set()
        this.playerTree = new QuadTree(BOUNDING_BOX, TREE_CONFIG)

        this.server.instances.add(this)
    }
    addPlayer(player) {
        this.playerTree.insert(player)
        this.players.add(player)
        player.instance = this
    }
    removePlayer(player) {
        this.playerTree.remove(player)
        this.players.delete(player)
        player.players.forget()
        player.inst = null
    }
    getPlayers(position, distance = 15) {
        const box = new Box(position.x - distance, position.y - distance, position.x + distance, position.y + distance)
        return this.playerTree.query(box)
    }
    playerMoved(player) {
        this.playersRequiringMovement.add(player)
    }
    update() {
        for (let player of this.players) {
            player.update()
        }
        // this... i don't like this. but it will have to work for now.
        for (let player of this.playersRequiringMovement) {
            this.playerTree.remove(player)
            this.playerTree.insert(player)
        }
        this.playersRequiringMovement.clear()
    }
}

module.exports = Instance