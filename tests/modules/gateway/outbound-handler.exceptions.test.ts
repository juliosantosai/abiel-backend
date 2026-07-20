import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OutboundMessageHandler } from '../../../src/modules/gateway/application/outbound-message-handler';
import { logger } from '../../../src/shared/logger/logger';

describe('OutboundMessageHandler exceptions', () => {
  let originalInfo: any;

  beforeEach(() => {
    originalInfo = logger.info;
  });

  afterEach(() => {
    logger.info = originalInfo;
  });

  it('should throw if logger.info throws (simulate outbound error)', async () => {
    logger.info = () => { throw new Error('simulated logger failure'); };
    const h = new OutboundMessageHandler();
    const event: any = { payload: { conversationId: 't1:u1', messageContent: 'hi' }, metadata: { tenantId: 't1' } };
    await expect(h.handle(event)).rejects.toThrow('simulated logger failure');
  });
});
