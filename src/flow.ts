type BlockType = 'start' | 'any' | 'all' | 'when' | 'and' | 'then' | 'delay'
type ConnectorType = 'out' | 'true' | 'false' | 'error'
type FlowState = 'waiting' | 'running' | 'finished' | 'error' | 'blocked'

type Output = {
    connector: ConnectorType
    to: Flow
}

type Block = {
    type: BlockType
    idx: string
    key: string
}

type AnyBlock = Block & {
    connections: number
    handled: number
}

type AllBlock = Block & {
    connections: number
    handled: number
}

type DelayBlock = Block & {
    delay: number
}

type Tag = {
    tag: string
    value: null | string | number | boolean | Date
    generatedBy?: string
}

type Result = {
    connector: ConnectorType | 'blocked' | 'waiting'
    tags: Tag[]
    took: number
    error?: string
}

class Flow {
    block: Block | AnyBlock | AllBlock
    outputs: Output[]
    result: null | Result = null
    state: FlowState = 'waiting'
    updateCallback: CallableFunction

    constructor(block: Block, outputs: Output[], updateCallback: CallableFunction) {
        this.block = block
        this.outputs = outputs
        this.updateCallback = updateCallback
    }

    public start(tags: null | Tag[]) {
        this.result = null
        this.state = 'running'
        this.updateCallback(this)
        this.executeBlock(tags ?? [])
            .then((result) => {
                this.handleResult(result)
            }, (reason) => {
                this.handleError(reason)
            })
    }

    private executeBlock(tags: Tag[]): Promise<Result> {
        return new Promise((resolve, reject) => {
            let runtime = 100
            if(this.block.type === 'and' || this.block.type === 'then')
                runtime = Math.floor(Math.random() * 100) + 100

            if (this.block.type === 'any') {
                let anyBlock = this.block as AnyBlock
                anyBlock.handled++
                if (anyBlock.handled > 1) {
                    resolve({connector: 'blocked', tags: tags, took:runtime})
                    return
                }
            }

            if(this.block.type === 'delay') {
                runtime = this.block.delay;
            }

            if (this.block.type === 'all') {
                let allBlock = this.block as AllBlock
                allBlock.handled++

                if (allBlock.handled < allBlock.connections) {
                    resolve({connector: 'waiting', tags: tags, took: runtime})
                    return
                }
            }

            setTimeout(() => {

                let output: ConnectorType = 'out'
                if (this.block.type === 'and') {
                    output = (Math.random() > 0.6) ? 'true' : 'false'
                }

                resolve({connector: output, tags: tags, took: runtime})
            }, runtime)
        })
    }

    private handleResult(result: Result): void {
        this.result = result
        this.state = (result.connector === 'blocked') ? 'blocked' : 'finished'
        this.updateCallback(this)

        for (let i in this.outputs) {
            let output = this.outputs[i]
            if (output.connector === result.connector) {
                output.to.start(result.tags)
            }
        }
    }

    private handleError(reason: string): void {
        this.result = {
            connector: 'error',
            tags: [{tag: 'error', value: reason}],
            took: 0,
            error: reason
        }
        this.state = 'error'
        this.updateCallback(this)

        for (let i in this.outputs) {
            let output = this.outputs[i]
            if (output.connector === 'error') {
                output.to.start(this.result.tags)
            }
        }
    }
}

type Line = Array<number | string | boolean>
type BlockDefinition = {
    type: BlockType
}

type BlockDefinitions = {
    [key: string]: BlockDefinition
}

class FlowService {
    createdBlocks: { [key: string]: Block } = {}

    public createFlow(
        startBlock: string,
        lines: Line[],
        blocks: { [key: string]: { block: string } },
        blockDefinitions: BlockDefinitions,
        updateCallback: CallableFunction
    ): Flow {
        let outputs: Output[] = []

        let block = this.createdBlocks[startBlock] ?? null

        if (block === null) {
            let blockKey = blocks[startBlock].block
            let group = blocks[startBlock].group;

            block = {type: blockDefinitions[group][blockKey].type, key: blockKey, idx: startBlock}
            this.createdBlocks[startBlock] = block
        }

        let connections = this.getConnectedLines(startBlock, lines)
        let inputs = this.getInommingLines(startBlock, lines).length

        for (let i in connections) {
            let line = connections[i]
            let connector = line[2] as string
            if (connector === '') {
                connector = 'out'
            }

            outputs.push({
                connector: connector as ConnectorType,
                to: this.createFlow(line[1] as string, lines, blocks, blockDefinitions, updateCallback)
            })
        }

        if (block.type === 'any') {
            let anyBlock = block as AnyBlock
            anyBlock.handled = 0
            anyBlock.connections = inputs
            block = anyBlock
        }

        if (block.type === 'all') {
            let allBlock = block as AllBlock
            allBlock.handled = 0
            allBlock.connections = inputs
            block = allBlock
        }

        if(block.type === 'delay') {
            let delayBlock = block as DelayBlock
            delayBlock.delay = blocks[block.idx].variables.delay;
            block = delayBlock
        }

        return new Flow(block, outputs, updateCallback)
    }

    private getConnectedLines(block: string, lines: Line[]): Line[] {
        let connectedLines: Line[] = []
        for (let i in lines) {
            if (lines[i][0] === block) {
                connectedLines.push(lines[i])
            }
        }

        return connectedLines
    }

    private getInommingLines(block: string, lines: Line[]): Line[] {
        let connectedLines: Line[] = []
        for (let i in lines) {
            if (lines[i][1] === block) {
                connectedLines.push(lines[i])
            }
        }

        return connectedLines
    }
}

export type {ConnectorType, Line}
export {FlowService, Flow}