<script lang="ts">
  import type { CompiFile } from '$lib/types';
  import type { PageData } from './$types';
  export let data: PageData;

  $: console.log('data: ', data);

  const baseUrl = 'https://compey.s3.eu-central-1.amazonaws.com';

  function getBucket(bucket: string) {
    return bucket.startsWith('archive_') ? bucket.split('archive_')[1] : bucket;
  }

  function getImgUrl(bucket: string, id: string) {
    return `${baseUrl}/${getBucket(bucket)}/${id}`.replaceAll(' ', '+');
  }

  type WinsAndLosses = {
    imgUrl: string;
    fileDetailPage: string;
    wins?: number;
    losses?: number;
    id: string;
  };

  let winsAndLosses: { [key: string]: WinsAndLosses } = {};

  function calculateWinsOrLosses(
    obj: { [key: string]: number },
    identifier: 'wins' | 'losses'
  ) {
    for (let [key, value] of Object.entries(obj)) {
      if (!winsAndLosses[key]) {
        winsAndLosses[key] = {
          imgUrl: getImgUrl(data.file.bucket, key),
          [identifier]: value,
          fileDetailPage: `/admin/${getBucket(data.file.bucket)}/${key}`,
          id: key
        };
      } else {
        winsAndLosses[key][identifier] = value;
      }
    }
  }

  $: {
    console.log('changing');
    winsAndLosses = {};
    calculateWinsOrLosses(data.file.wins, 'wins');
    calculateWinsOrLosses(data.file.losses, 'losses');
  }

  function getSuccessRate(file: CompiFile) {
    const successRate =
      (file.totalWins / (file.totalWins + file.totalLosses)) * 100;
    return `${Math.floor(successRate)} %`;
  }
</script>

<div class="flex flex-col items-center my-3">
  <h1 class="text-2xl mb-3">
    {data.file.fileName || 'NoName'}

    <a
      class="btn btn-primary ml-3"
      href={`/admin/${getBucket(data.file.bucket)}`}>Show Admin Page</a
    >
  </h1>

  <div class="flex flex-row justify-center items-center whitespace-nowrap" />
</div>

<div class="flex flex-row px-3 h-max-screen gap-4">
  <div class="basis-1/4">
    <img src={getImgUrl(data.file.bucket, data.file.id)} alt="Img" />
    <div class="stats shadow mt-3">
      <div class="stat">
        <div class="stat-title">Succes Rate</div>
        <div class="stat-value">
          {getSuccessRate(data.file)}
        </div>
      </div>
      <div class="stat">
        <div class="stat-title">Total Wins</div>
        <div class="stat-value text-success">{data.file.totalWins}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Total Losses</div>
        <div class="stat-value text-error">{data.file.totalLosses}</div>
      </div>
    </div>
  </div>
  <div class="overflow-auto basis-3/4 h-full">
    <table class="table w-full">
      <!-- head -->
      <thead class="sticky top-0">
        <tr>
          <th>Image</th>
          <th>Wins</th>
          <th>Losses</th>
        </tr>
      </thead>
      <tbody class="overflow-auto">
        <!-- row 1 -->
        {#each Object.values(winsAndLosses) as obj (obj.id)}
          <tr>
            <td class="w-24 h-24">
              <a href={obj.fileDetailPage}>
                <img src={obj.imgUrl} alt="img" />
              </a>
            </td>
            <td>{obj.wins || 0}</td>
            <td>{obj.losses || 0}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
