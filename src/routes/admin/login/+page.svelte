<div class="flex flex-col items-center my-3">
  <h1 class="text-2xl">Login</h1>
  <form method="POST" class="w-58">
    <div class="form-control w-full">
      <label class="label" for="name">
        <span class="label-text">Bucket Id</span>
      </label>
      <input
        name="bucket"
        type="text"
        placeholder="Enter bucket..."
        class="input input-bordered w-full"
      />
    </div>
    <div class="form-control w-full mb-3">
      <label class="label" for="password">
        <span class="label-text">Password</span>
      </label>
      <input
        name="password"
        type="password"
        placeholder="Enter password..."
        class="input input-bordered w-full"
      />
    </div>
    <button class="btn btn-primary">Login</button>
  </form>
</div>
