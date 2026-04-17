import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

export interface PortInfo {
  path: string
  manufacturer?: string
}

export class SerialManager {
  private port: SerialPort | null = null

  async listPorts(): Promise<PortInfo[]> {
    const ports = await SerialPort.list()
    return ports.map((p) => ({ path: p.path, manufacturer: p.manufacturer }))
  }

  async connect(path: string, onData: (pin: number, peak: number) => void, onError: (msg: string) => void): Promise<void> {
    if (this.port?.isOpen) {
      this.port.close()
      this.port = null
    }

    this.port = new SerialPort({ path, baudRate: 57600 })
    this.port.on('error', (err) => onError(err.message))
    const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

    parser.on('data', (line: string) => {
      const match = line.trim().match(/^(\d+):(\d+)$/)
      if (match) {
        onData(parseInt(match[1], 10), parseInt(match[2], 10))
      }
    })
  }

  async tryConnect(path: string, onData: (pin: number, peak: number) => void, onError: (msg: string) => void): Promise<boolean> {
    if (this.port?.isOpen) {
      this.port.close()
      this.port = null
    }

    const port = new SerialPort({ path, baudRate: 57600, autoOpen: false })

    try {
      await new Promise<void>((resolve, reject) => {
        port.open((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    } catch {
      return false
    }

    this.port = port
    this.port.on('error', (err) => onError(err.message))
    const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
    parser.on('data', (line: string) => {
      const match = line.trim().match(/^(\d+):(\d+)$/)
      if (match) {
        onData(parseInt(match[1], 10), parseInt(match[2], 10))
      }
    })

    return true
  }

  sendCommand(command: string): void {
    if (this.port?.isOpen) {
      this.port.write(command + '\n')
    }
  }

  disconnect(): void {
    if (this.port?.isOpen) {
      this.port.close()
    }
    this.port = null
  }
}
