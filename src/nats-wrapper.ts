import nats from 'node-nats-streaming';
import type { Stan } from "node-nats-streaming";

class NatsWrapper {
  private _client?: Stan;

  connect(clusterId: string, clientId: string, url: string): Promise<void> {

    return new Promise((resolve, reject) => {
      const client = nats.connect(clusterId, clientId, {
        url: url
      });

      client.on('connect', () => {
        console.log('Connected to NATS');
        this._client = client;
        resolve();
      });

      client.on('error', (err) => {
        reject(err);
      });
    });
  }

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }
}

export const natsWrapper = new NatsWrapper();