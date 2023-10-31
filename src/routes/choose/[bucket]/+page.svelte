<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
  let img1chosen = false;
  let img2chosen = false;

  const baseUrl = 'https://compey.s3.eu-central-1.amazonaws.com';
  //   /e590693c-5408-480d-aa6a-e86d3c88fd6f/Screenshot+2023-05-12+at+23.13.45.png
  const img1Url =
    `${baseUrl}/${data.files[0].bucket}/${data.files[0].id}`.replaceAll(
      ' ',
      '+'
    );
  const img2Url =
    `${baseUrl}/${data.files[1].bucket}/${data.files[1].id}`.replaceAll(
      ' ',
      '+'
    );

  console.log('img1Url: ', img1Url);
  console.log('img2Url: ', img2Url);

  function chooseImg1() {
    img1chosen = !img1chosen;
    img2chosen = false;
  }

  function chooseImg2() {
    img2chosen = !img2chosen;
    img1chosen = false;
  }
</script>

<form method="POST" class="">
  <div class="flex flex-col items-center pt-3">
    <h1 class="text-2xl pb-3">
      Choose the more awesome {data.bucket?.name || ''} art!
    </h1>
  </div>

  <div class="choose-area">
    <div class="img-wrapper img1-wrapper">
      <img
        src={img1Url}
        alt=":)"
        class="cursor-pointer"
        on:click={chooseImg1}
      />
      <div class="button-wrapper">
        <button class="btn btn-primary" on:click={chooseImg1}>
          {#if img1chosen}
            <input
              name="chosenImg"
              type="checkbox"
              checked
              class="checkbox checkbox-primary"
              value={data.files[0].id}
            />
          {:else}
            Choose
            <input class="hidden" name="unchosenImg" value={data.files[0].id} />
          {/if}
        </button>
      </div>
    </div>

    <div class="img-wrapper img2-wrapper">
      <img
        src={img2Url}
        alt="(:"
        class="cursor-pointer"
        on:click={chooseImg2}
      />

      <div class="button-wrapper">
        <button class="btn btn-primary" on:click={chooseImg2}>
          {#if img2chosen}
            <input
              name="chosenImg"
              type="checkbox"
              checked
              class="checkbox checkbox-primary"
              value={data.files[1].id}
            />
          {:else}
            Choose
            <input class="hidden" name="unchosenImg" value={data.files[1].id} />
          {/if}
        </button>
      </div>
    </div>
  </div>
  <div class="submit-wrapper">
    <div class="flex items-center gap-4 submit-wrapper-inner">
      <textarea
        name="comment"
        placeholder="Comment on your decision (optional) ..."
        class="textarea textarea-bordered flex-grow"
      />
      <button class="btn btn-primary" disabled={!(img1chosen || img2chosen)}
        >Submit</button
      >
    </div>
  </div>
</form>

<style>
  @media (min-width: 800px) {
    .choose-area {
      position: relative;
      height: calc(100vh - 200px);
      margin: 0 10%;
    }

    .img-wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      margin: auto;
      width: 50%;
      height: 100%;
    }

    .img-wrapper img {
      width: 100%;
      height: calc(100% - 3em);
      object-fit: contain;
      padding: 1em;
    }

    /* center containing button horizontally */
    .button-wrapper {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    .img1-wrapper {
      left: 0;
    }
    .img2-wrapper {
      right: 0;
    }

    .submit-wrapper {
      position: absolute;
      bottom: 1em;
      width: 100%;
    }
    .submit-wrapper-inner {
      margin: 0 10%;
    }
  }

  @media (max-width: 799px) {
    .img-wrapper {
      text-align: center;
    }

    .img-wrapper img {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 0.8em auto; /* This will center the image if it's smaller than its container */
    }

    .img-wrapper button {
      display: block;
      margin: 10px auto;
    }

    .submit-wrapper {
      margin: 1em 10%;
    }
  }
</style>
