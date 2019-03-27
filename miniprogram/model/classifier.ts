/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {
  MobileNet
} from './mobilenet';
import * as tfjs from '@tensorflow/tfjs';
const tf  = requirePlugin('myPlugin') as typeof tfjs;

export class Classifier {
  private mobileNet: MobileNet;
  // tslint:disable-next-line:no-any
  constructor(private page: any) {
  }
  async load() {
    this.mobileNet = new MobileNet();
    this.page.setData!({ result: 'loading model...' });
    const start = Date.now();
    await this.mobileNet.load();
    const result = `model loaded: ${Date.now() - start}ms\n`;
    this.page.setData!({ result });
  }

  classify(ab: ArrayBuffer, size: CameraSize) {
    const data = new Uint8Array(ab);
    console.log(data[0], data[1], data[2]);
    let result = '';
    const start = Date.now();
    tf.tidy(() => {
      const pixels = tf.tensor3d(data, [size.height, size.width, 4], 'float32')
          .slice([0, 0, 0], [-1, -1, 3]);
      const tensor = this.mobileNet.predict(pixels) as tfjs.Tensor;

      const topK = this.mobileNet.getTopKClasses(tensor, 5);
      result += `prediction: ${Date.now() - start}ms\n`;
      result += topK.map((x, i) => `${x.value.toFixed(3)}: ${x.label}`).join('\n');
      return result;
    });
    this.page.setData!({result});
  }
  dispose() {
    this.mobileNet.dispose();
  }
}
