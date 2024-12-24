import { logger } from '../utils/logger';

interface Alert {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

class AlertSystem {
  private alerts: Alert[] = [];

  triggerAlert(alert: Omit<Alert, 'timestamp'>): void {
    const fullAlert: Alert = {
      ...alert,
      timestamp: Date.now(),
    };

    this.alerts.push(fullAlert);
    this.notifyAlert(fullAlert);
  }

  private notifyAlert(alert: Alert): void {
    // In a real app, you might want to:
    // - Send email notifications
    // - Send Slack messages
    // - Trigger PagerDuty
    // - etc.
    logger.warn('Alert triggered:', alert);
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }
}

const alertSystem = new AlertSystem();

export function setupAlerts(): void {
  // TODO: Implement alert system
}

export function triggerAlert(
  type: string,
  message: string,
  severity: Alert['severity']
): void {
  alertSystem.triggerAlert({ type, message, severity });
}
