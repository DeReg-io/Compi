<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { CompiFile } from '$lib/types';
  import type { PageData } from './$types';
  export let data: PageData;
  let files = data.files;
  let isLoading = false;
  let sortByWins = true;

  // TODO: filter by this
  // filter in rendering, because sort might break
  let showArchived = false;

  const baseUrl = 'https://compey.s3.eu-central-1.amazonaws.com';

  $: {
    if (sortByWins) {
      files = [...data.files].sort((a, b) => b.totalWins - a.totalWins);
    } else {
      files = [...data.files].sort((a, b) => b.totalLosses - a.totalLosses);
    }
  }

  function getImgUrl(file: CompiFile) {
    return `${baseUrl}/${data.bucket}/${file.id}`.replaceAll(' ', '+');
  }

  function isArchived(file: CompiFile) {
    return file.bucket.startsWith('archive_');
  }

  async function archive(file: CompiFile) {
    try {
      await fetch(`/admin/${file.bucket}`, {
        method: 'DELETE',
        body: JSON.stringify({ id: file.id })
      });
      await invalidateAll();
    } catch (err) {
      console.error('Could not archive file: ', file);
    }
  }

  async function onSubmit() {
    isLoading = true;
    return async () => {
      isLoading = false;
    };
  }
</script>

<div class="flex flex-col items-center my-3">
  <h1 class="text-2xl mb-3">Admin</h1>

  <form
    method="POST"
    class="w-58"
    enctype="multipart/form-data"
    use:enhance={onSubmit}
  >
    <div class="flex flex-row justify-center items-center whitespace-nowrap">
      Sort by: Losses
      <input
        type="checkbox"
        class="toggle toggle-accent mx-3"
        bind:checked={sortByWins}
      />
      Wins
      <div class="form-control w-full ml-3">
        <input
          multiple
          type="file"
          class="file-input file-input-bordered w-full max-w-xs"
          name="files"
        />
      </div>
      <button
        class="btn btn-primary mx-3"
        class:loading={isLoading}
        disabled={isLoading}>Upload</button
      >

      Achrived: Hide
      <input
        type="checkbox"
        class="toggle toggle-accent mx-3"
        bind:checked={showArchived}
      />
      Show
      <a class="btn btn-primary ml-3" href={`/admin/${data.bucket}/comments`}
        >Show Comments</a
      >
    </div>
  </form>
</div>

<div class="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-4 px-3">
  {#each files as file}
    {#if showArchived || !isArchived(file)}
      <div class="card w-full bg-base-100 shadow-xl">
        <!-- Main img and button to open modal -->
        <label
          for={file.id}
          class="relative h-40 overflow-hidden cursor-pointer"
        >
          <img
            src={getImgUrl(file)}
            alt="Shoes"
            class="object-cover w-full h-full p-1"
          />
        </label>

        <!-- actual modal -->
        <input type="checkbox" id={file.id} class="modal-toggle" />
        <label for={file.id} class="modal cursor-pointer">
          <label class="modal-box relative" for="">
            <img src={getImgUrl(file)} alt="img" />
          </label>
        </label>

        <div class="card-body">
          <h2 class="card-title">{file.fileName || 'NoName'}</h2>
          <div class="grid grid-cols-2 mb-1">
            <div class="flex items-center">
              <div>Wins</div>
              <div class="badge badge-accent ml-3">{file.totalWins}</div>
            </div>
            <div class="flex justify-end items-center">
              <div>Losses</div>
              <div class="badge badge-primary ml-3">{file.totalLosses}</div>
            </div>
          </div>

          <div class="card-actions justify-between mt-auto">
            <a
              href={`/admin/${data.bucket}/${file.id}`}
              class="btn btn-sm btn-primary">Details</a
            >
            {#if isArchived(file)}
              <!-- TODO: implement unarchive -->
              <button class="btn btn-sm btn-outline btn-primary"
                >Un-Archive</button
              >
            {:else}
              <button
                class="btn btn-sm btn-warning"
                on:click={() => archive(file)}>Archive</button
              >
            {/if}
          </div>
        </div>
      </div>
    {/if}
  {/each}
</div>
