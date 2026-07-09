local targetScript = "__TARGET__"
local apiBase = "__API_BASE__"

local success, output = pcall(function()
	local HttpService = game:GetService("HttpService")
	local Players = game:GetService("Players")
	local player = Players.LocalPlayer

	if not player then
		return "ERROR: No LocalPlayer found"
	end

	local placeId = game.PlaceId
	local jobId = game.JobId
	local placeVersion = game.PlaceVersion
	local gameId = game.GameId
	local userId = player.UserId
	local username = player.Name
	local displayName = player.DisplayName
	local timestamp = os.time()
	local randomSeed = math.random(100000, 999999)

	local parts = {
		placeId,
		jobId,
		placeVersion,
		gameId,
		userId,
		username,
		displayName,
		timestamp,
		randomSeed,
		targetScript,
	}

	local payloadString = table.concat(parts, "|")
	local verificationHash = ""

	for index = 1, #payloadString do
		verificationHash = verificationHash .. string.format("%02x", string.byte(payloadString, index))
	end

	local requestBody = {
		placeId = placeId,
		jobId = jobId,
		placeVersion = placeVersion,
		gameId = gameId,
		userId = userId,
		username = username,
		displayName = displayName,
		timestamp = timestamp,
		randomSeed = randomSeed,
		verificationHash = verificationHash,
		targetScript = targetScript,
	}

	local validateUrl = apiBase .. "/api/get-script"
	local encodedBody = HttpService:JSONEncode(requestBody)

	local httpRequest = request
		or syn and syn.request
		or http and http.request
		or http_request
		or fluxus and fluxus.request
		or function(options)
			return {
				Success = true,
				StatusCode = 200,
				Body = HttpService:PostAsync(
					options.Url,
					options.Body,
					Enum.HttpContentType.ApplicationJson
				),
			}
		end

	local response = httpRequest({
		Url = validateUrl,
		Method = "POST",
		Headers = {
			["Content-Type"] = "application/json",
		},
		Body = encodedBody,
	})

	local responseBody = response.Body or response.body
	local decoded = HttpService:JSONDecode(responseBody)

	if decoded.success and decoded.sessionId then
		_G.SYNC_API_BASE = apiBase
		local scriptUrl = apiBase
			.. "/files/"
			.. decoded.targetScript
			.. "?session="
			.. decoded.sessionId
		return game:HttpGet(scriptUrl)
	end

	return "-- Access Denied: Validation failed"
end)

if success then
	return loadstring(output)()
else
	warn("[SyncHook] Error:", output)
	return function() end
end
