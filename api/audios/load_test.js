import http from 'k6/http';
import {sleep, check} from 'k6';
import { Rate } from 'k6/metrics';
import { FormData } from "https://jslib.k6.io/formdata/0.0.1/index.js";

export const errorRate = new Rate('errors');

const fileName = "12.wav"

const binFile = open(fileName, 'b');
export default function () {
  const requestBody = new FormData()
  requestBody.append('file', http.file(binFile, fileName),)
  // const url = 'http://sttlab.learnit.ir/api/voice';
  const url = 'http://192.168.1.20:8000/api/voice';

  const params = {
    headers: {
      'Content-Type': "multipart/form-data; boundary=" + requestBody.boundary,
    },
    timeout:"20s"
  };
  check(http.post(url, requestBody.body(), params),{
    "status code is 200" : (r)=> r.status===200,
  }) || errorRate.add(1)
  sleep(1);
}
