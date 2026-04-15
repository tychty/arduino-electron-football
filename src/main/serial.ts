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

  async connect(path: string, onData: (value: number) => void): Promise<void> {
    if (this.port?.isOpen) {
      this.port.close()
      this.port = null
    }

    this.port = new SerialPort({ path, baudRate: 9600 })
    const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

    parser.on('data', (line: string) => {
      const match = line.trim().match(/^peak:\s*(\d+)$/)
      if (match) {
        onData(parseInt(match[1], 10))
      }
    })
  }

  disconnect(): void {
    if (this.port?.isOpen) {
      this.port.close()
    }
    this.port = null
  }
}
