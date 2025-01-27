/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

import { AjaxResponse } from '@typo3/core/ajax/ajax-response';
import { AbstractInteractableModule } from '../abstract-interactable-module';
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Router from '../../router';
import MessageInterface from '@typo3/install/message-interface';
import RegularEvent from '@typo3/core/event/regular-event';
import type { ModalElement } from '@typo3/backend/modal';

/**
 * Module: @typo3/install/module/clear-typo3temp-files
 */
class ClearTypo3tempFiles extends AbstractInteractableModule {
  private readonly selectorDeleteTrigger: string = '.t3js-clearTypo3temp-delete';
  private readonly selectorOutputContainer: string = '.t3js-clearTypo3temp-output';
  private readonly selectorStatContainer: string = '.t3js-clearTypo3temp-stat-container';
  private readonly selectorStatsTrigger: string = '.t3js-clearTypo3temp-stats';
  private readonly selectorStatTemplate: string = '.t3js-clearTypo3temp-stat-template';
  private readonly selectorStatNumberOfFiles: string = '.t3js-clearTypo3temp-stat-numberOfFiles';
  private readonly selectorStatDirectory: string = '.t3js-clearTypo3temp-stat-directory';

  public initialize(currentModal: ModalElement): void {
    super.initialize(currentModal);
    this.getStats();

    new RegularEvent('click', (event: Event): void => {
      event.preventDefault();
      currentModal.querySelector(this.selectorOutputContainer).innerHTML = '';
      this.getStats();
    }).delegateTo(currentModal, this.selectorStatsTrigger);

    new RegularEvent('click', (event: Event, trigger: HTMLElement): void => {
      event.preventDefault();
      const folder = trigger.dataset.folder;
      const storageUid = trigger.dataset.storageUid !== undefined ? parseInt(trigger.dataset.storageUid, 10) : undefined;
      this.delete(folder, storageUid);
    }).delegateTo(currentModal, this.selectorDeleteTrigger);
  }

  private getStats(): void {
    this.setModalButtonsState(false);

    const modalContent = this.getModalBody();
    (new AjaxRequest(Router.getUrl('clearTypo3tempFilesStats')))
      .get({ cache: 'no-cache' })
      .then(
        async (response: AjaxResponse): Promise<void> => {
          const data = await response.resolve();
          if (data.success === true) {
            modalContent.innerHTML = data.html;
            Modal.setButtons(data.buttons);
            if (Array.isArray(data.stats) && data.stats.length > 0) {
              data.stats.forEach((element: any): void => {
                if (element.numberOfFiles > 0) {
                  const aStat = modalContent.querySelector(this.selectorStatTemplate).cloneNode(true) as HTMLElement;
                  aStat.querySelector<HTMLElement>(this.selectorStatNumberOfFiles).innerText = (element.numberOfFiles);
                  aStat.querySelector<HTMLElement>(this.selectorStatDirectory).innerText = (element.directory);
                  aStat.querySelector<HTMLElement>(this.selectorDeleteTrigger).setAttribute('data-folder', element.directory);
                  if (element.storageUid !== undefined) {
                    aStat.querySelector<HTMLElement>(this.selectorDeleteTrigger).setAttribute('data-storage-uid', element.storageUid);
                  }
                  modalContent.querySelector(this.selectorStatContainer).append(aStat);
                }
              });
            }
          } else {
            Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
          }
        },
        (error: AjaxResponse): void => {
          Router.handleAjaxError(error, modalContent);
        }
      );
  }

  private delete(folder: string, storageUid: number|undefined): void {
    const modalContent = this.getModalBody();
    const executeToken = this.getModuleContent().dataset.clearTypo3tempDeleteToken;
    (new AjaxRequest(Router.getUrl()))
      .post({
        install: {
          action: 'clearTypo3tempFiles',
          token: executeToken,
          folder: folder,
          storageUid: storageUid,
        },
      })
      .then(
        async (response: AjaxResponse): Promise<void> => {
          const data = await response.resolve();
          if (data.success === true && Array.isArray(data.status)) {
            data.status.forEach((element: MessageInterface): void => {
              Notification.success(element.title, element.message);
            });
            this.getStats();
          } else {
            Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
          }
        },
        (error: AjaxResponse): void => {
          Router.handleAjaxError(error, modalContent);
        }
      );
  }
}

export default new ClearTypo3tempFiles();
