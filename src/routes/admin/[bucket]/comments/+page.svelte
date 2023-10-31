<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;

  const baseUrl = 'https://compey.s3.eu-central-1.amazonaws.com';

  function getImgUrl(bucket: string, id: string) {
    return `${baseUrl}/${bucket}/${id}`.replaceAll(' ', '+');
  }

  function getLocaleDateString(isoDateString: string) {
    let date = new Date(isoDateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
</script>

<div class="flex flex-col items-center my-3">
  <h1 class="text-2xl mb-3">Comments</h1>
</div>

<div class="flex flex-row justify-center items-center whitespace-nowrap mb-5">
  <a class="btn btn-primary ml-3" href={`/admin/${data.bucket}`}
    >Show Admin Page</a
  >
</div>

<div class="w-full px-7">
  <table class="table w-full">
    <!-- head -->
    <thead class="sticky top-0">
      <tr>
        <th>Winner</th>
        <th>Looser</th>
        <th>Comment</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody class="overflow-auto">
      <!-- row 1 -->
      {#each data.comments as comment (comment.id)}
        <tr>
          <td class="w-24 h-24">
            <a href={`/admin/${comment.bucket}/${comment.winnerId}`}>
              <img
                src={getImgUrl(comment.bucket, comment.winnerId)}
                alt="Winner"
              />
            </a>
          </td>
          <td class="w-24 h-24">
            <a href={`/admin/${comment.bucket}/${comment.looserId}`}>
              <img
                src={getImgUrl(comment.bucket, comment.looserId)}
                alt="Looser"
              />
            </a>
          </td>
          <td class="whitespace-normal">
            {comment.comment}
          </td>
          <td>
            {getLocaleDateString(comment.createdAt)}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
