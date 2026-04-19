import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { BAUD_RATE, SERIAL_DELIMITER } from '../shared/config'

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

  private attachParser(onData: (pin: number, peak: number) => void, onError: (msg: string) => void): void {
    this.port!.on('error', (err) => onError(err.message))
    const parser = this.port!.pipe(new ReadlineParser({ delimiter: SERIAL_DELIMITER }))
    parser.on('data', (line: string) => {
      const match = line.trim().match(/^(\d+):(\d+)$/)
      if (match) onData(parseInt(match[1], 10), parseInt(match[2], 10))
    })
  }

  async connect(path: string, onData: (pin: number, peak: number) => void, onError: (msg: string) => void): Promise<void> {
    if (this.port?.isOpen) {
      this.port.close()
      this.port = null
    }

    this.port = new SerialPort({ path, baudRate: BAUD_RATE })
    this.attachParser(onData, onError)
  }

  async tryConnect(path: string, onData: (pin: number, peak: number) => void, onError: (msg: string) => void): Promise<boolean> {
    if (this.port?.isOpen) {
      this.port.close()
      this.port = null
    }

    const port = new SerialPort({ path, baudRate: BAUD_RATE, autoOpen: false })

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
    this.attachParser(onData, onError)
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
